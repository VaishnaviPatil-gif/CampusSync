const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { queryGet, queryRun } = require("../services/dbService");

const JWT_SECRET = process.env.FLASK_SECRET_KEY || "dev_secret_key_student360";

exports.register = async (req, res) => {
  const { fullName, email, password, confirmPassword, role, college } = req.body;

  if (!fullName || !email || !password || !confirmPassword || !role || !college) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "All fields are required" }
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "Passwords do not match" }
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "Password must be at least 6 characters long" }
    });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  try {
    // Check if account already exists
    const existing = await queryGet("SELECT id FROM users WHERE email = ?", [sanitizedEmail]);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 409, message: "Account already exists. Please Sign In instead." }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // Insert user
    const userResult = await queryRun(
      "INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [sanitizedEmail, passwordHash, normalizedRole, now, now]
    );

    const userId = userResult.lastID;

    // Insert profile based on role
    if (normalizedRole === "student") {
      // Derive default class from classes table or fallback
      const clazz = await queryGet("SELECT id FROM classes WHERE college = ? LIMIT 1", [college]);
      const classId = clazz ? clazz.id : null;
      await queryRun(
        "INSERT INTO students (user_id, full_name, college, class_id, created_at) VALUES (?, ?, ?, ?, ?)",
        [userId, fullName.trim(), college, classId, now]
      );
    } else if (normalizedRole === "teacher") {
      await queryRun(
        "INSERT INTO teachers (user_id, full_name, college, subject, created_at) VALUES (?, ?, ?, ?, ?)",
        [userId, fullName.trim(), college, "Mathematics", now]
      );
    } else if (normalizedRole === "parent") {
      await queryRun(
        "INSERT INTO parents (user_id, full_name, college, created_at) VALUES (?, ?, ?, ?)",
        [userId, fullName.trim(), college, now]
      );
    }

    // Sign JWT
    const token = jwt.sign(
      { user_id: userId, email: sanitizedEmail, role: normalizedRole, college },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        email: sanitizedEmail,
        full_name: fullName.trim(),
        role: normalizedRole,
        college
      }
    });
  } catch (err) {
    console.error("[EXPRESS REGISTRATION ERROR]", err.message);
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Internal server error" }
    });
  }
};

exports.login = async (req, res) => {
  const { email, password, role, college } = req.body;

  if (!email || !password || !role || !college) {
    return res.status(400).json({
      success: false,
      error: { code: 400, message: "All fields are required" }
    });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  try {
    const user = await queryGet("SELECT * FROM users WHERE email = ?", [sanitizedEmail]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: "Account does not exist. Please Sign Up first." }
      });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: "This account has no password set. Please reset your password or sign up again." }
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Invalid email or password." }
      });
    }

    const now = new Date().toISOString();
    await queryRun("UPDATE users SET role = ?, updated_at = ? WHERE email = ?", [normalizedRole, now, sanitizedEmail]);

    // Fetch profile full name
    let fullName = "";
    if (normalizedRole === "student") {
      const p = await queryGet("SELECT full_name FROM students WHERE user_id = ?", [user.id]);
      fullName = p ? p.full_name : "";
    } else if (normalizedRole === "teacher") {
      const p = await queryGet("SELECT full_name FROM teachers WHERE user_id = ?", [user.id]);
      fullName = p ? p.full_name : "";
    } else if (normalizedRole === "parent") {
      const p = await queryGet("SELECT full_name FROM parents WHERE user_id = ?", [user.id]);
      fullName = p ? p.full_name : "";
    }

    // Sign JWT
    const token = jwt.sign(
      { user_id: user.id, email: sanitizedEmail, role: normalizedRole, college },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        email: sanitizedEmail,
        full_name: fullName,
        role: normalizedRole,
        college
      }
    });
  } catch (err) {
    console.error("[EXPRESS LOGIN ERROR]", err.message);
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Internal server error" }
    });
  }
};
