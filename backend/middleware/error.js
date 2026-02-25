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
  let message = `Database Error: ${err.message}`;

  if (err.code === "42703")
    message = `Column does not exist. Check your query!`;
  if (err.code === "42P01") message = `Table does not exist.`;
  if (err.code === "23505") message = `Duplicate record found in database.`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

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
  console.log(err);
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    // PostgreSQL Handler (Add this!)
    // Postgres codes are usually 5-character strings
    if (err.code && typeof err.code === "string" && err.code.length === 5) {
      error = handlePostgreSQLError(error);
    }
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
