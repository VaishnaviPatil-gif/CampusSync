const { queryGet, queryAll, queryRun } = require("../services/dbService");

exports.getDashboard = async (req, res) => {
  const { user_id, email, college } = req.user;

  try {
    const student = await queryGet(
      "SELECT s.*, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id WHERE s.user_id = ?",
      [user_id]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Student profile not found" }
      });
    }

    const studentId = student.id;
    const classId = student.class_id;

    // Academic KPIs calculation
    const totalRow = await queryGet("SELECT COUNT(*) as total FROM attendance WHERE student_id = ?", [studentId]);
    const total = totalRow ? totalRow.total : 0;
    let attendancePct = "100.0%";
    if (total > 0) {
      const presentRow = await queryGet("SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'Present'", [studentId]);
      const present = presentRow ? presentRow.present : 0;
      attendancePct = `${((present / total) * 100).toFixed(1)}%`;
    }

    const assignmentsRow = await queryGet("SELECT COUNT(*) as count FROM assignments WHERE class_id = ? OR class_id IS NULL", [classId]);
    const assignmentsCount = assignmentsRow ? assignmentsRow.count : 0;

    // Latest sensor reading
    const latestSensor = await queryGet("SELECT * FROM sensor_readings ORDER BY received_at DESC LIMIT 1");

    // Latest mood log stress
    const moodRow = await queryGet("SELECT stress_level FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC LIMIT 1", [studentId]);
    const latestStress = moodRow ? moodRow.stress_level : (latestSensor ? latestSensor.stress_level : 0);

    res.json({
      success: true,
      data: {
        student_info: {
          id: studentId,
          name: student.full_name,
          college: student.college,
          class_name: student.class_name || "N/A"
        },
        academic_kpis: {
          attendance_percentage: attendancePct,
          engagement_score: "8.3/10",
          assignments_count: assignmentsCount,
          weak_subjects_count: 2,
          suggestions_count: 3
        },
        vitals: {
          temperature: latestSensor ? latestSensor.temperature : null,
          humidity: latestSensor ? latestSensor.humidity : null,
          heart_rate: latestSensor ? latestSensor.heart_rate : null,
          stress_level: latestStress,
          received_at: latestSensor ? latestSensor.received_at : null
        }
      }
    });
  } catch (err) {
    console.error("[EXPRESS STUDENT DASHBOARD ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getAttendance = async (req, res) => {
  const { user_id } = req.user;
  try {
    const student = await queryGet("SELECT id FROM students WHERE user_id = ?", [user_id]);
    if (!student) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Student profile not found" } });
    }
    const list = await queryAll("SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC", [student.id]);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getMood = async (req, res) => {
  const { user_id } = req.user;
  try {
    const student = await queryGet("SELECT id FROM students WHERE user_id = ?", [user_id]);
    if (!student) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Student profile not found" } });
    }
    const list = await queryAll("SELECT * FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC", [student.id]);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.postMood = async (req, res) => {
  const { user_id } = req.user;
  const { mood, stressLevel } = req.body;

  if (!mood || stressLevel === undefined) {
    return res.status(400).json({ success: false, error: { code: 400, message: "mood and stressLevel are required" } });
  }

  try {
    const student = await queryGet("SELECT id FROM students WHERE user_id = ?", [user_id]);
    if (!student) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Student profile not found" } });
    }

    const now = new Date().toISOString();
    const result = await queryRun(
      "INSERT INTO mood_logs (student_id, mood, stress_level, recorded_at) VALUES (?, ?, ?, ?)",
      [student.id, mood, Number(stressLevel), now]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        student_id: student.id,
        mood,
        stress_level: Number(stressLevel),
        recorded_at: now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getJournal = async (req, res) => {
  const { user_id } = req.user;
  try {
    const student = await queryGet("SELECT id FROM students WHERE user_id = ?", [user_id]);
    if (!student) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Student profile not found" } });
    }
    const list = await queryAll("SELECT * FROM journal_entries WHERE student_id = ? ORDER BY created_at DESC", [student.id]);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.postJournal = async (req, res) => {
  const { user_id } = req.user;
  const { entryText } = req.body;

  if (!entryText) {
    return res.status(400).json({ success: false, error: { code: 400, message: "entryText is required" } });
  }

  try {
    const student = await queryGet("SELECT id FROM students WHERE user_id = ?", [user_id]);
    if (!student) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Student profile not found" } });
    }

    const now = new Date().toISOString();
    const result = await queryRun(
      "INSERT INTO journal_entries (student_id, entry_text, sentiment_score, created_at) VALUES (?, ?, ?, ?)",
      [student.id, entryText, 0.75, now]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        student_id: student.id,
        entry_text: entryText,
        sentiment_score: 0.75,
        created_at: now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
