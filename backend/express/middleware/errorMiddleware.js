function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;
  console.error("[EXPRESS CENTRAL ERROR]", err.stack || err.message);
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: statusCode === 500 ? "Internal server error" : err.message
    }
  });
}

module.exports = errorHandler;
