const { queryGet, queryAll, queryRun } = require("../services/dbService");

exports.getStudents = async (req, res) => {
  const { college } = req.user;

  try {
    const studentsList = await queryAll(
      `SELECT s.*, c.name as class_name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.college = ? 
       ORDER BY s.full_name`,
      [college]
    );

    const enriched = [];
    for (const student of studentsList) {
      const studentId = student.id;

      // Attendance percentage
      const totalRow = await queryGet("SELECT COUNT(*) as total FROM attendance WHERE student_id = ?", [studentId]);
      const total = totalRow ? totalRow.total : 0;
      let attendancePct = "100.0%";
      let rawPct = 100.0;
      if (total > 0) {
        const presentRow = await queryGet("SELECT COUNT(*) as present FROM attendance WHERE student_id = ? AND status = 'Present'", [studentId]);
        const present = presentRow ? presentRow.present : 0;
        rawPct = (present / total) * 100;
        attendancePct = `${rawPct.toFixed(1)}%`;
      }

      // Latest stress
      const moodRow = await queryGet("SELECT stress_level FROM mood_logs WHERE student_id = ? ORDER BY recorded_at DESC LIMIT 1", [studentId]);
      const latestStress = moodRow ? moodRow.stress_level : 0;

      // Risk classification
      let riskLevel = "low";
      if (rawPct < 70 || latestStress > 75) {
        riskLevel = "high";
      } else if (rawPct < 80 || latestStress > 55) {
        riskLevel = "medium";
      }

      enriched.push({
        id: studentId,
        name: student.full_name,
        email: student.email,
        class_name: student.class_name || "N/A",
        attendance_percentage: attendancePct,
        stress_level: latestStress,
        risk_level: riskLevel,
        marks_average: "72%"
      });
    }

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("[EXPRESS TEACHER STUDENTS ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getAssignments = async (req, res) => {
  const { user_id } = req.user;

  try {
    const teacher = await queryGet("SELECT id FROM teachers WHERE user_id = ?", [user_id]);
    if (!teacher) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Teacher profile not found" } });
    }

    const assignments = await queryAll(
      "SELECT a.*, c.name as class_name FROM assignments a LEFT JOIN classes c ON a.class_id = c.id WHERE a.teacher_id = ? ORDER BY a.due_date ASC",
      [teacher.id]
    );

    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.createAssignment = async (req, res) => {
  const { user_id, college } = req.user;
  const { className, title, description, dueDate, attachmentUrl } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ success: false, error: { code: 400, message: "title and dueDate are required" } });
  }

  try {
    const teacher = await queryGet("SELECT id, subject FROM teachers WHERE user_id = ?", [user_id]);
    if (!teacher) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Teacher profile not found" } });
    }

    // Resolve class ID
    let classId = null;
    if (className) {
      const clazz = await queryGet("SELECT id FROM classes WHERE name = ? AND college = ?", [className, college]);
      if (clazz) {
        classId = clazz.id;
      }
    }

    const result = await queryRun(
      "INSERT INTO assignments (class_id, teacher_id, subject, title, description, due_date, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [classId, teacher.id, teacher.subject, title, description || null, dueDate, attachmentUrl || null]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        class_id: classId,
        teacher_id: teacher.id,
        subject: teacher.subject,
        title,
        description: description || null,
        due_date: dueDate,
        attachment_url: attachmentUrl || null
      }
    });
  } catch (err) {
    console.error("[EXPRESS CREATE ASSIGNMENT ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.updateAssignment = async (req, res) => {
  const { user_id } = req.user;
  const assignmentId = Number(req.params.id);
  const { title, description, dueDate, attachmentUrl } = req.body;

  try {
    const teacher = await queryGet("SELECT id FROM teachers WHERE user_id = ?", [user_id]);
    if (!teacher) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Teacher profile not found" } });
    }

    const assignment = await queryGet("SELECT * FROM assignments WHERE id = ?", [assignmentId]);
    if (!assignment || assignment.teacher_id !== teacher.id) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Assignment not found or unauthorized" } });
    }

    await queryRun(
      "UPDATE assignments SET title = ?, description = ?, due_date = ?, attachment_url = ? WHERE id = ?",
      [
        title || assignment.title,
        description !== undefined ? description : assignment.description,
        dueDate || assignment.due_date,
        attachmentUrl !== undefined ? attachmentUrl : assignment.attachment_url,
        assignmentId
      ]
    );

    res.json({ success: true, message: "Assignment updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.deleteAssignment = async (req, res) => {
  const { user_id } = req.user;
  const assignmentId = Number(req.params.id);

  try {
    const teacher = await queryGet("SELECT id FROM teachers WHERE user_id = ?", [user_id]);
    if (!teacher) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Teacher profile not found" } });
    }

    const assignment = await queryGet("SELECT * FROM assignments WHERE id = ?", [assignmentId]);
    if (!assignment || assignment.teacher_id !== teacher.id) {
      return res.status(404).json({ success: false, error: { code: 404, message: "Assignment not found or unauthorized" } });
    }

    await queryRun("DELETE FROM assignments WHERE id = ?", [assignmentId]);
    res.json({ success: true, message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
