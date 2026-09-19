const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);

  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  // Errors we raise deliberately (ApiError) keep their message so clients can act
  // on them; unexpected crashes stay generic so internals are never leaked.
  const message =
    err.statusCode && err.statusCode >= 400 ? err.message : "Something went wrong on the server";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { notFound, errorHandler };
