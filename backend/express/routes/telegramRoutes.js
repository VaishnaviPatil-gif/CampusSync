const express = require("express");
const router = express.Router();
const telegramController = require("../controllers/telegramController");

// Register user (POST /api/telegram/register)
router.post("/register", telegramController.registerTelegram);

// Get users (GET /api/telegram/users)
router.get("/users", telegramController.getTelegramUsers);

// Test bot (GET /api/telegram/test)
router.get("/test", telegramController.testTelegram);

module.exports = router;
