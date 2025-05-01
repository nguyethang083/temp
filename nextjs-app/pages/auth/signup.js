import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { Eye, EyeOff } from "react-feather";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

const SignUp = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    ageOrLevel: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError("You must agree to the terms of service to continue");
      return;
    }

    try {
      setSignupLoading(true);
      setError("");

      // Use Supabase auth from context
      const { error, data } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age_level: formData.ageOrLevel,
            full_name: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to email verification page
      router.push("/auth/verify-email");
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError("");

      // Use Supabase OAuth for Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Note: No need for additional code here as Supabase handles the redirect
    } catch (err) {
      setError("Failed to connect with Google");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    try {
      // Use Supabase OAuth for Apple
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError("Failed to connect with Apple");
    }
  };

  return (
    <AuthLayout title="Sign Up - 1">
      <h1 className="text-3xl font-semibold mb-2">Create account</h1>
      <p className="text-gray-600 mb-6">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Login
        </Link>
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="ageOrLevel"
            placeholder="Age or Level"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.ageOrLevel}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email or Phone number"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              checked={agreeTerms}
              onChange={() => setAgreeTerms(!agreeTerms)}
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to E-learning's{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">
                Terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">
                Privacy policy
              </Link>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={signupLoading}
          className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        >
          {signupLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="my-6 flex items-center justify-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 mb-3"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
        <FcGoogle className="text-xl" />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={handleAppleSignup}
        className="w-full flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
        </svg>
        Continue with Apple
      </button>
    </AuthLayout>
  );
};

export default SignUp;
