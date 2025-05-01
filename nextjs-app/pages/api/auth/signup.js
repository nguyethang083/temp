/**
 * API route for user registration
 *
 * Kết hợp việc đăng ký với Frappe và NextAuth
 */

import axios from "axios";
import { setCookie } from "nookies";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { first_name, last_name, age_level, email, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Forward request to Frappe backend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.signup`,
      {
        first_name,
        last_name,
        age_level,
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Store email in cookies for verification page
    // This allows the verification page to show the email
    setCookie({ res }, "userEmail", email, {
      maxAge: 30 * 60, // 30 minutes
      path: "/",
    });

    // Send verification email using NodeMailer directly
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      // Generate a verification token
      const token = Buffer.from(email).toString("base64");
      const url = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to E-learning - Verify your email address",
        text: `Thank you for signing up! Please click the link below to verify your email address:\n\n${url}\n\n`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Welcome to E-learning</h2>
            <p>Hi ${first_name},</p>
            <p>Thank you for signing up! Please click the button below to verify your email address.</p>
            <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
            <p>${url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>E-learning Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // We continue even if sending email fails
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Signup successful, please verify your email",
      email: email,
    });
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);

    // Handle specific error cases from Frappe
    if (error.response?.data?.message) {
      return res.status(error.response.status || 400).json({
        message: error.response.data.message,
      });
    }

    return res
      .status(500)
      .json({ message: "An error occurred during registration" });
  }
}
