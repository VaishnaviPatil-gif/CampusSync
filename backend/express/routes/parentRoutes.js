const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");
const { tokenRequired, roleRequired } = require("../middleware/authMiddleware");

router.get("/dashboard", tokenRequired, roleRequired("parent"), parentController.getDashboard);

module.exports = router;
