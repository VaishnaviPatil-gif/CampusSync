const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.FLASK_SECRET_KEY || "dev_secret_key_student360";

function tokenRequired(req, res, next) {
  let token = null;
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 401, message: "Token is missing" }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("[EXPRESS JWT ERROR]", err.message);
    return res.status(401).json({
      success: false,
      error: { code: 401, message: "Token is invalid or expired" }
    });
  }
}

function roleRequired(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: "Unauthorized" }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 403, message: "Access forbidden for this role" }
      });
    }

    next();
  };
}

module.exports = {
  tokenRequired,
  roleRequired
};
