const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");
const { tokenRequired } = require("../middleware/authMiddleware");

// v2 REST Specification endpoints
router.get("/latest", tokenRequired, sensorController.getLatestSensor);
router.get("/history", tokenRequired, sensorController.getHistory);

module.exports = router;
