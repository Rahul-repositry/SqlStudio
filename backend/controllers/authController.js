import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendOTPEmail } from "../config/email.js";
import AppError from "../error/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "90d" });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const expiryDate = new Date(Date.now() + 1000 * 90 * 60 * 24 * 60); // 90 days

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    expires: expiryDate,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
  const message = "Account verified and created successfully!";
  const data = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  return res
    .cookie("access_token", token, cookieOptions)
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
};

export const verifyAndSignup = asyncHandler(async (req, res, next) => {
  const { name, email, password, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
  });

  const isOTPValid = user && user.otpExpires > Date.now();

  if (!isOTPValid) {
    return next(
      new AppError(
        "Invalid OTP or the OTP has expired. Please request a new one.",
        400,
      ),
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user.name = name;
  user.password = hashedPassword;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  createSendToken(user, 201, res);
});

export const getOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // 1. Gmail Validation Check
  if (!email || !email.toLowerCase().endsWith("@gmail.com")) {
    return next(
      new AppError("Only Gmail addresses are allowed for registration.", 400),
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    return next(
      new AppError(
        "This email is already registered and verified. Please login.",
        400,
      ),
    );
  }

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  await sendOTPEmail(email, otp);

  // 3. Upsert: If user exists (unverified), update them. If not, create them.
  // This prevents the "Ghost Account" problem you identified.
  await User.findOneAndUpdate(
    { email },
    { otp, otpExpires, isVerified: false },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // 4. Send the actual email

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "OTP sent to your email! It expires in 10 minutes.",
      ),
    );
});


export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const match = await bcrypt.compare(password, user.password);

  if (!user || !match) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Please verify your email first", 401));
  }

  createSendToken(user, 200, res);
});
