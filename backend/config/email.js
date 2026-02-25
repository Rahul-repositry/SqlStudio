import dotenv from "dotenv";
dotenv.config(); //

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password here
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `${process.env.EMAIL_USER}`,
    to: email,
    subject: "Your CipherSQL Verification Code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
};
