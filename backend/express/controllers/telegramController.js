const { queryGet, queryRun } = require("../services/dbService");
const {
  registerUserTelegramId,
  getAllTelegramIds,
  testTelegramConnection
} = require("../telegram/telegramService");

exports.registerTelegram = async (req, res) => {
  const { userId, chatId, studentId, parentEmail } = req.body;

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "chatId is required."
    });
  }

  try {
    let parentId = null;

    if (parentEmail) {
      const parent = await queryGet(
        "SELECT p.id FROM parents p JOIN users u ON p.user_id = u.id WHERE u.email = ?",
        [parentEmail.trim().toLowerCase()]
      );
      if (parent) {
        parentId = parent.id;
      }
    } else if (userId) {
      const parent = await queryGet("SELECT id FROM parents WHERE user_id = ?", [userId]);
      if (parent) {
        parentId = parent.id;
      }
    }

    if (parentId && studentId) {
      await queryRun(
        `INSERT INTO relationships (parent_id, student_id, relation_type, telegram_chat_id)
         VALUES (?, ?, 'guardian', ?)
         ON CONFLICT(parent_id, student_id) DO UPDATE SET telegram_chat_id = excluded.telegram_chat_id`,
        [parentId, Number(studentId), chatId]
      );
      console.log(`[EXPRESS TELEGRAM REGISTRATION] Linked parent ${parentId} to student ${studentId} with chatId ${chatId} in DB.`);
    } else {
      console.log("[EXPRESS TELEGRAM REGISTRATION] Parent ID or Student ID missing, registered chat ID in-memory only.");
    }

    // Retain legacy memory registration for compatibility
    const sanitizedEmail = (parentEmail || "").trim().toLowerCase();
    const emailBasedUserId = sanitizedEmail ? `parent_${sanitizedEmail}` : "";
    const resolvedUserId = userId || emailBasedUserId || `parent_${studentId || Date.now()}`;
    
    registerUserTelegramId(resolvedUserId, chatId);

    res.status(200).json({
      success: true,
      message: `Telegram registration saved with chat ID ${chatId}.`,
      registration: {
        userId: resolvedUserId,
        studentId: studentId || null,
        chatId
      }
    });
  } catch (err) {
    console.error("[EXPRESS TELEGRAM REGISTER ERROR]", err.message);
    res.status(500).json({ success: false, error: { code: 500, message: "Internal server error" } });
  }
};

exports.getTelegramUsers = (req, res) => {
  const allIds = getAllTelegramIds();
  res.json({
    success: true,
    count: Object.keys(allIds).length,
    users: allIds
  });
};

exports.testTelegram = async (req, res) => {
  const result = await testTelegramConnection();
  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
};
