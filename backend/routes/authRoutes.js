import express from "express";
import {
  verifyAndSignup,
  getOTP,
  login,
} from "../controllers/authController.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
const router = express.Router();

const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("access_token");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully!"));
});

router.post("/get-otp", getOTP);
router.post("/login", login);
router.post("/signup", verifyAndSignup);
router.post("/logout", logout);

export default router;
