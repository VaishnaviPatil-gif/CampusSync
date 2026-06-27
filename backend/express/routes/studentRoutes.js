const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { tokenRequired, roleRequired } = require("../middleware/authMiddleware");

router.get("/dashboard", tokenRequired, roleRequired("student"), studentController.getDashboard);
router.get("/attendance", tokenRequired, roleRequired("student"), studentController.getAttendance);
router.get("/mood", tokenRequired, roleRequired("student"), studentController.getMood);
router.post("/mood", tokenRequired, roleRequired("student"), studentController.postMood);
router.get("/journal", tokenRequired, roleRequired("student"), studentController.getJournal);
router.post("/journal", tokenRequired, roleRequired("student"), studentController.postJournal);

module.exports = router;
