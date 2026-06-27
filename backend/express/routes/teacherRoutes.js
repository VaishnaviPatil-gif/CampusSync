const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { tokenRequired, roleRequired } = require("../middleware/authMiddleware");

router.get("/students", tokenRequired, roleRequired("teacher"), teacherController.getStudents);
router.get("/assignments", tokenRequired, roleRequired("teacher"), teacherController.getAssignments);
router.post("/assignments", tokenRequired, roleRequired("teacher"), teacherController.createAssignment);
router.put("/assignments/:id", tokenRequired, roleRequired("teacher"), teacherController.updateAssignment);
router.delete("/assignments/:id", tokenRequired, roleRequired("teacher"), teacherController.deleteAssignment);

module.exports = router;
