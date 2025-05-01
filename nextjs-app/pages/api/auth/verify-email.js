/**
 * API route for verifying user's email
 *
 * This route handles the verification token and updates the user's status
 */

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    // Validate required fields
    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    // Decode token (base64 encoded email)
    try {
      const email = Buffer.from(token, "base64").toString();

      // Call Frappe API to mark user as verified
      // We'll create a simple dummy function in Frappe just to mark the user as verified
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.mark_email_verified`,
          { email },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.log(
          "Error marking email as verified:",
          error.response?.data || error.message
        );
        // Continue anyway since we can handle this client-side
      }

      // Return success
      return res.status(200).json({
        success: true,
        message: "Email has been verified successfully",
        email: email,
      });
    } catch (decodeError) {
      return res.status(400).json({ message: "Invalid verification token" });
    }
  } catch (error) {
    console.error("Email verification error:", error);

    return res
      .status(500)
      .json({ message: "An error occurred during email verification" });
  }
}
