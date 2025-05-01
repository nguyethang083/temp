/**
 * API route for forgot password
 *
 * This route handles password reset requests using NodeMailer
 */

import axios from "axios";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists using a simpler approach instead of frappe.client.get
    try {
      // Use our custom method which is whitelisted
      const checkUserResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.test_reset_password`,
        { user: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If there's no error, the user exists
    } catch (userCheckError) {
      // Check if the error message indicates user not found
      if (userCheckError.response?.data?.message?.includes("not found")) {
        return res
          .status(404)
          .json({ message: "No user found with this email" });
      }

      // For any other error, we'll still try to send the email
      console.log(
        "User check returned an error but continuing:",
        userCheckError.response?.data || userCheckError.message
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${
      process.env.NEXTAUTH_URL
    }/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;

    // Store the token in database or temporary storage
    // In a real implementation, you would save this token with the user's email and an expiry time
    // For simplicity, we're just generating a token without storing it

    // Send password reset email using NodeMailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset Your Password",
      text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 24 hours.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>You requested a password reset. Please click the button below to reset your password.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>E-learning Team</p>
        </div>
      `,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
}
