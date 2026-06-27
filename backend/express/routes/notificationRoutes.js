const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { tokenRequired } = require("../middleware/authMiddleware");

router.get("/", tokenRequired, notificationController.getNotifications);
router.post("/send", tokenRequired, notificationController.postNotification);

module.exports = router;
