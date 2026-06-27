const { queryGet, queryAll } = require("../services/dbService");

exports.getDashboard = async (req, res) => {
  const { user_id } = req.user;

  try {
    const parent = await queryGet("SELECT id FROM parents WHERE user_id = ?", [user_id]);
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Parent profile not found" }
      });
    }

    const children = await queryAll(
      `SELECT s.*, c.name as class_name, r.relation_type 
       FROM relationships r
       JOIN students s ON r.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE r.parent_id = ?`,
      [parent.id]
    );

    const dashboardData = [];
    for (const child of children) {
      const studentId = child.id;

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
      let riskClassification = "Stable";
      if (rawPct < 70 || latestStress > 75) {
        riskClassification = "High Risk";
      } else if (rawPct < 80 || latestStress > 55) {
        riskClassification = "Needs Attention";
      }

      dashboardData.push({
        student_id: studentId,
        name: child.full_name,
        class_name: child.class_name || "N/A",
        college: child.college,
        attendance_percentage: attendancePct,
        stress_level: latestStress,
        risk_classification: riskClassification,
        marks_average: "72%"
      });
    }

    res.json({ success: true, data: dashboardData });
  } catch (err) {
    console.error("[EXPRESS PARENT DASHBOARD ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
