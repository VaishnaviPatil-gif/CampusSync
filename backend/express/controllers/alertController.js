const { queryGet, queryAll, queryRun } = require("../services/dbService");
const { sendTelegramAlert } = require("../telegram/telegramService");

function resolveFallbackChatId() {
  return process.env.TELEGRAM_DEFAULT_CHAT_ID ||
         process.env.TELEGRAM_CHAT_ID ||
         process.env.CHAT_ID ||
         "";
}

// Ingestion for sensor data
exports.receiveSensorData = async (req, res) => {
  const temperature = req.body.temperature ?? req.body.temp;
  const humidity = req.body.humidity ?? req.body.hum;
  const heartRate = req.body.heartRate ?? req.body.bpm;

  if (
    temperature === undefined ||
    humidity === undefined ||
    heartRate === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "temperature, humidity, and heartRate are required."
    });
  }

  const updatedData = {
    temperature: Number(temperature),
    humidity: Number(humidity),
    heartRate: Number(heartRate),
    receivedAt: new Date().toISOString()
  };

  try {
    // Write sensor reading to database
    // calculate mock stress
    const hrScore = Math.min(100.0, Math.max(0.0, (updatedData.heartRate - 60.0) * 1.5));
    const tempScore = Math.min(100.0, Math.max(0.0, (updatedData.temperature - 25.0) * 3.0));
    const humScore = Math.min(100.0, Math.max(0.0, (updatedData.humidity - 40.0) * 1.2));
    const stress = Number((0.6 * hrScore + 0.25 * tempScore + 0.15 * humScore).toFixed(1));

    await queryRun(
      "INSERT INTO sensor_readings (temperature, humidity, heart_rate, stress_level, received_at) VALUES (?, ?, ?, ?, ?)",
      [updatedData.temperature, updatedData.humidity, updatedData.heartRate, stress, updatedData.receivedAt]
    );

    res.status(200).json({
      success: true,
      message: "Sensor data received successfully.",
      data: { ...updatedData, stress }
    });
  } catch (err) {
    console.error("[EXPRESS SENSOR INGEST ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

// Retrieve latest readings
exports.getLatestSensor = async (req, res) => {
  try {
    const latestData = await queryGet("SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1");
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: "No sensor data available yet."
      });
    }

    res.json({
      success: true,
      temperature: latestData.temperature,
      humidity: latestData.humidity,
      heartRate: latestData.heart_rate,
      stress: latestData.stress_level,
      receivedAt: latestData.received_at,
      data: {
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        heartRate: latestData.heart_rate,
        stress: latestData.stress_level,
        receivedAt: latestData.received_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

// Student list retrieval
exports.getStudents = async (req, res) => {
  const requestedCollege = String(req.query.college || "").trim();

  try {
    let studentsList;
    if (requestedCollege) {
      studentsList = await queryAll(
        `SELECT s.id, s.full_name as name, c.name as class, s.college 
         FROM students s 
         LEFT JOIN classes c ON s.class_id = c.id 
         WHERE s.college = ?`,
        [requestedCollege]
      );
    } else {
      studentsList = await queryAll(
        `SELECT s.id, s.full_name as name, c.name as class, s.college 
         FROM students s 
         LEFT JOIN classes c ON s.class_id = c.id`
      );
    }

    res.json({
      success: true,
      count: studentsList.length,
      data: studentsList
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

// Trigger parent alert via Telegram
exports.sendParentAlert = async (req, res) => {
  const {
    studentId,
    className,
    reason = "Teacher alert",
    riskLevel = "high"
  } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: "studentId is required."
    });
  }

  try {
    const student = await queryGet("SELECT * FROM students WHERE id = ?", [studentId]);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    // Query parent telegram_chat_id from DB
    const rel = await queryGet("SELECT telegram_chat_id FROM relationships WHERE student_id = ? LIMIT 1", [studentId]);
    let targetChatId = rel ? rel.telegram_chat_id : null;
    
    if (!targetChatId) {
      targetChatId = resolveFallbackChatId();
    }

    if (!targetChatId) {
      return res.status(404).json({
        success: false,
        message: "Telegram recipient chat ID not configured."
      });
    }

    const latestData = await queryGet("SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1");

    const alertRecord = {
      studentId: student.id,
      studentName: student.full_name,
      class: className || student.class_name || "N/A",
      riskLevel,
      reason,
      triggeredAt: new Date().toISOString(),
      temperature: latestData ? latestData.temperature : null,
      humidity: latestData ? latestData.humidity : null,
      heartRate: latestData ? latestData.heart_rate : null
    };

    // Log alert into DB notifications
    await queryRun(
      "INSERT INTO notifications (user_id, title, message, status, channel, created_at) VALUES (?, ?, ?, 'unread', 'Telegram', ?)",
      [student.user_id, `Alert: ${riskLevel.toUpperCase()}`, reason, alertRecord.triggeredAt]
    );

    const sent = await sendTelegramAlert(targetChatId, alertRecord);
    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "Unable to send Telegram alert to configured recipient."
      });
    }

    res.status(200).json({
      success: true,
      message: "Telegram alert sent successfully.",
      alert: alertRecord,
      recipient: {
        chatId: targetChatId
      }
    });
  } catch (err) {
    console.error("[EXPRESS SEND PARENT ALERT ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

// Trigger high-risk general alert and broadcast
exports.sendAlert = async (req, res) => {
  const { studentId, reason = "High-risk behavior detected", riskLevel = "high" } = req.body;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: "studentId is required to trigger an alert."
    });
  }

  try {
    const student = await queryGet("SELECT * FROM students WHERE id = ?", [studentId]);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    const latestData = await queryGet("SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1");
    const alertRecord = {
      studentId: student.id,
      studentName: student.full_name,
      class: student.class_name || "N/A",
      riskLevel,
      reason,
      triggeredAt: new Date().toISOString(),
      temperature: latestData ? latestData.temperature : null,
      humidity: latestData ? latestData.humidity : null,
      heartRate: latestData ? latestData.heart_rate : null
    };

    // Fetch all unique parent Telegram chat IDs from relationships
    const rels = await queryAll("SELECT DISTINCT telegram_chat_id FROM relationships WHERE telegram_chat_id IS NOT NULL AND telegram_chat_id != ''");
    let chatIds = rels.map((r) => r.telegram_chat_id);

    if (chatIds.length === 0) {
      const fallback = resolveFallbackChatId();
      if (fallback) {
        chatIds.push(fallback);
      }
    }

    let successCount = 0;
    let failCount = 0;

    for (const chatId of chatIds) {
      const sent = await sendTelegramAlert(chatId, alertRecord);
      if (sent) {
        successCount++;
      } else {
        failCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: "Alert triggered successfully.",
      alert: alertRecord,
      telegramNotifications: {
        sent: successCount,
        failed: failCount
      }
    });
  } catch (err) {
    console.error("[EXPRESS BROADCAST ALERT ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

// Fetch alert history
exports.getAlertHistory = async (req, res) => {
  try {
    const list = await queryAll(
      `SELECT n.*, u.email as user_email 
       FROM notifications n 
       JOIN users u ON n.user_id = u.id 
       WHERE n.channel = 'Telegram' 
       ORDER BY n.created_at DESC`
    );
    res.json({
      success: true,
      count: list.length,
      alerts: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
