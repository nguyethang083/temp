/**
 * API route for resending verification email
 *
 * This route uses NextAuth's EmailProvider to send verification emails
 */

import axios from "axios";
import { sendVerificationRequest } from "next-auth/providers/email";
import nodemailer from "nodemailer";

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

    // Check if user exists in Frappe backend
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.resend_verification_email`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.log("User check error:", error.response?.data || error.message);
      // Continue anyway as we're going to send the email using NextAuth
    }

    // Send verification email using NextAuth's EmailProvider
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Generate a verification token (a simple way for demo)
    const token = Buffer.from(email).toString("base64");
    const url = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      text: `Please click the link below to verify your email address:\n\n${url}\n\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Verify your email address</h2>
          <p>Thank you for signing up! Please click the button below to verify your email address.</p>
          <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
          <p>${url}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>E-learning Team</p>
        </div>
      `,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Verification email has been sent",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "An error occurred when sending the verification email",
    });
  }
}
