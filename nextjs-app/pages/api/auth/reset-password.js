/**
 * API route for resetting password
 *
 * This route resets password using our custom endpoint
 */

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { token, email, new_password } = req.body;

    // Validate required fields
    if (!email || !new_password) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    // Validate password strength on the server side as well
    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Use our custom API endpoint for updating password
    try {
      // Make call to our custom update_user_password endpoint
      const updateResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.update_user_password`,
        {
          user: email,
          new_password: new_password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If successful, return success response
      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (updateError) {
      console.error(
        "Password update error:",
        updateError.response?.data || updateError.message
      );

      // Handle specific Frappe error messages
      let errorMessage = "Failed to update password. Please try again later.";

      if (updateError.response?.data?.exc) {
        const exc = updateError.response.data.exc;

        // Check for specific error types
        if (exc.includes("common password")) {
          errorMessage =
            "Please choose a stronger password. This is a common password that could be easily guessed.";
        } else if (exc.includes("All-uppercase")) {
          errorMessage =
            "Password cannot be all uppercase. Mix uppercase and lowercase letters.";
        } else if (exc.includes("ValidationError")) {
          errorMessage =
            "Invalid password format. Please choose a stronger password.";
        } else if (updateError.response?.data?.message) {
          errorMessage = updateError.response.data.message;
        }
      }

      return res.status(400).json({ message: errorMessage });
    }
  } catch (error) {
    console.error("Reset password error:", error);

    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
}

// Hàm kiểm tra mật khẩu mạnh
function validatePassword(password) {
  // Kiểm tra độ dài tối thiểu
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Kiểm tra mật khẩu phổ biến
  const commonPasswords = [
    "password",
    "Password",
    "PASSWORD",
    "12345678",
    "qwerty",
    "admin",
  ];
  if (commonPasswords.includes(password)) {
    return {
      isValid: false,
      message: "This is a common password. Please choose a stronger one",
    };
  }

  // Kiểm tra có ít nhất một chữ hoa, một chữ thường và một số
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  // Kiểm tra không chỉ toàn chữ hoa hoặc toàn chữ thường
  if (
    password === password.toUpperCase() ||
    password === password.toLowerCase()
  ) {
    return {
      isValid: false,
      message: "Password cannot be all uppercase or all lowercase",
    };
  }

  return { isValid: true, message: "Valid password" };
}
