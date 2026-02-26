import jwt from "jsonwebtoken";
import AppError from "../error/AppError.js";
import dotenv from "dotenv";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
dotenv.config();

export const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // 1. Get token
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(new AppError("You are not logged in.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Get user (explicitly select needed fields)
    const user = await User.findById(decoded.id).select(
      "-password -otp -otpExpires",
    );

    if (!user) {
      return next(new AppError("User no longer exists.", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }

    return next(new AppError("Invalid token.", 401));
  }
});
