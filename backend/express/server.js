require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const alertRoutes = require("./routes/alertRoutes");
const telegramRoutes = require("./routes/telegramRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const parentRoutes = require("./routes/parentRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3001;
const HOST = process.env.EXPRESS_HOST || "0.0.0.0";

// Production Security middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Log requests
app.use(morgan("combined"));

// Rate limiting (100 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 429,
      message: "Too many requests from this IP, please try again later."
    }
  }
});
app.use(limiter);

// Root path index documentation info
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student360 Express backend v2 is running.",
    endpoints: {
      auth: "/api/auth/*",
      student: "/api/student/*",
      teacher: "/api/teacher/*",
      parent: "/api/parent/*",
      sensors: "/api/sensors/*",
      notifications: "/api/notifications/*",
      legacy: "/api/*"
    }
  });
});

// v2 REST Specification endpoints
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/notifications", notificationRoutes);

// Legacy compatible endpoints (POST /api, GET /api/latest, etc.)
app.use("/api", alertRoutes);

// Telegram endpoints
app.use("/api/telegram", telegramRoutes);

// Central error boundary
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`Student360 Express backend running at http://${HOST}:${PORT}`);
  console.log("CORS, Helmet, Rate Limiter, and Gzip compression active.");
});
