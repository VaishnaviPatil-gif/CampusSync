const { queryGet, queryAll, queryRun } = require("../services/dbService");

exports.getNotifications = async (req, res) => {
  const { user_id } = req.user;

  try {
    const list = await queryAll(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.postNotification = async (req, res) => {
  const { userId, title, message, channel = "InApp" } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "userId, title, and message are required" }
    });
  }

  const now = new Date().toISOString();

  try {
    const result = await queryRun(
      "INSERT INTO notifications (user_id, title, message, status, channel, created_at) VALUES (?, ?, ?, 'unread', ?, ?)",
      [Number(userId), title, message, channel, now]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        user_id: Number(userId),
        title,
        message,
        status: "unread",
        channel,
        created_at: now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};
