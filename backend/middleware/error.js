import AppError from "../error/AppError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Handle different MongoDB error message formats
  let value = "unknown field";

  if (err.errmsg && err.errmsg.match) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    if (match) value = match[0];
  } else if (err.message && err.message.match) {
    const match = err.message.match(/(["'])(\\?.)*?\1/);
    if (match) value = match[0];
  } else if (err.keyValue) {
    // Modern MongoDB error format
    const key = Object.keys(err.keyValue)[0];
    value = `${key}: ${err.keyValue[key]}`;
  }

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handlePostgreSQLError = (err) => {
  let message = err.message || "Database error occurred";

  // Make messages more user-friendly
  if (err.code === "42703") {
    // Extract column name from error if possible
    const match = err.message.match(/column "([^"]+)"/);
    const column = match ? match[1] : "unknown";
    message = `Column "${column}" does not exist. Check your query spelling!`;
  } else if (err.code === "42P01") {
    const match = err.message.match(/relation "([^"]+)"/);
    const table = match ? match[1] : "unknown";
    message = `Table "${table}" does not exist in the database.`;
  } else if (err.code === "42601") {
    message = `SQL syntax error: ${err.message.split("\n")[0]}`;
  } else if (err.code === "23505") {
    message = `Duplicate record: This would create a duplicate entry.`;
  } else if (err.code === "23503") {
    message = `Foreign key violation: Referenced record doesn't exist.`;
  } else if (err.code === "22001") {
    message = `Data too long for column.`;
  }
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log("Error details:", {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack,
  });

  if (process.env.NODE_ENV === "development") {
    // In development, send detailed error
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: {
        code: err.code,
        detail: err.detail || err.message,
        stack: err.stack,
      },
    });
  } else {
    // Production - sanitize errors
    let error = { ...err };
    error.message = err.message;

    // Handle different error types
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    // PostgreSQL error handling
    if (err.code && typeof err.code === "string") {
      error = handlePostgreSQLError(err);
    }

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
