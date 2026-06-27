const { queryGet, queryAll, queryRun } = require("../services/dbService");

function calculateStressLevel(temp, hum, hr) {
  const t = temp !== null && temp !== undefined ? Number(temp) : 27.0;
  const h = hum !== null && hum !== undefined ? Number(hum) : 50.0;
  const r = hr !== null && hr !== undefined ? Number(hr) : 72.0;

  const hrScore = Math.min(100.0, Math.max(0.0, (r - 60.0) * 1.5));
  const tempScore = Math.min(100.0, Math.max(0.0, (t - 25.0) * 3.0));
  const humScore = Math.min(100.0, Math.max(0.0, (h - 40.0) * 1.2));

  return Number((0.6 * hrScore + 0.25 * tempScore + 0.15 * humScore).toFixed(1));
}

exports.receiveSensorData = async (req, res) => {
  const temp = req.body.temperature ?? req.body.temp;
  const hum = req.body.humidity ?? req.body.hum;
  const hr = req.body.heartRate ?? req.body.bpm;
  let stress = req.body.stress;

  if (temp === undefined || hum === undefined || hr === undefined) {
    return res.status(400).json({
      success: false,
      message: "temperature, humidity, and heartRate are required."
    });
  }

  const tempVal = Number(temp);
  const humVal = Number(hum);
  const hrVal = Number(hr);

  if (stress === undefined || stress === null) {
    stress = calculateStressLevel(tempVal, humVal, hrVal);
  } else {
    stress = Number(stress);
  }

  const now = new Date().toISOString();

  try {
    const result = await queryRun(
      "INSERT INTO sensor_readings (temperature, humidity, heart_rate, stress_level, received_at) VALUES (?, ?, ?, ?, ?)",
      [tempVal, humVal, hrVal, stress, now]
    );

    const record = {
      id: result.lastID,
      temperature: tempVal,
      humidity: humVal,
      heartRate: hrVal,
      stress: stress,
      receivedAt: now
    };

    console.log("[EXPRESS SENSORS DB INGESTED]", record);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    console.error("[EXPRESS SENSORS INGEST ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getLatestSensor = async (req, res) => {
  try {
    const latest = await queryGet("SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1");
    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No sensor data available yet."
      });
    }

    res.json({
      success: true,
      temperature: latest.temperature,
      humidity: latest.humidity,
      heartRate: latest.heart_rate,
      stress: latest.stress_level,
      receivedAt: latest.received_at
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getHistory = async (req, res) => {
  const limit = Number(req.query.limit || 50);

  try {
    const history = await queryAll(
      "SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT ?",
      [limit]
    );

    // Reorder ascending chronologically
    const ordered = history.reverse().map((r) => ({
      temperature: r.temperature,
      humidity: r.humidity,
      heartRate: r.heart_rate,
      stress: r.stress_level,
      receivedAt: r.received_at
    }));

    res.json({ success: true, data: ordered });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
