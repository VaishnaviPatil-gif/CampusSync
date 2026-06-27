const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");

// IoT intake (POST /api)
router.post("/", alertController.receiveSensorData);

// Latest sensor (GET /api/latest)
router.get("/latest", alertController.getLatestSensor);

// Students list (GET /api/students)
router.get("/students", alertController.getStudents);

// Trigger parent alert (POST /api/alert/parent)
router.post("/alert/parent", alertController.sendParentAlert);

// Trigger general alert (POST /api/alert)
router.post("/alert", alertController.sendAlert);

// Alert history (GET /api/alert/history)
router.get("/alert/history", alertController.getAlertHistory);

module.exports = router;
