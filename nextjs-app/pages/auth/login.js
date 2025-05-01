import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthLayout from "../../components/AuthLayout";
import { Eye, EyeOff, ArrowLeft } from "react-feather";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";
import { signIn } from "next-auth/react";

const Login = () => {
  // Get Supabase client from your context
  const { supabase } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Clear error on component mount or route change
  useEffect(() => {
    setError(null);
  }, [router.asPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  // Handle Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError(null);

    if (!supabase) {
      setError("Authentication service is not available.");
      setLoginLoading(false);
      return;
    }

    try {
      // 1. Sign in with Supabase
      const { data: supabaseData, error: supabaseError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (supabaseError) {
        throw new Error(supabaseError.message || "Invalid email or password.");
      }

      // 2. If Supabase login is successful, get the access token
      const session = supabaseData.session;
      if (!session?.access_token) {
        throw new Error("Could not retrieve session token after login.");
      }

      // 3. Sign in with NextAuth using the 'credentials' provider
      console.log(
        "Attempting NextAuth sign in (will rely on redirect callback)..."
      );
      const nextAuthResponse = await signIn("credentials", {
        accessToken: session.access_token,
      });
      console.log(
        "NextAuth Sign In Response (after potential redirect):",
        nextAuthResponse
      );

      if (nextAuthResponse?.error) {
        console.error("NextAuth Sign In Error:", nextAuthResponse.error);
        throw new Error(
          nextAuthResponse.error ||
            "Login failed during application session setup."
        );
      }
    } catch (err) {
      console.error("Login Process Error:", err);
      setError(err.message || "An unexpected error occurred during login.");
      setLoginLoading(false);
    }
  };

  // Handle Google Login (Initiate Supabase OAuth Flow)
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    if (!supabase) {
      setError("Authentication service is not available.");
      setGoogleLoading(false);
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'profile email',
        }
      });

      if (oauthError) {
        throw new Error(
          oauthError.message || "Could not start Google Sign-In."
        );
      }
    } catch (err) {
      console.error("Google Login Initiation Error:", err);
      setError(err.message || "Failed to connect with Google.");
      setGoogleLoading(false);
    }
  };

  // Handle Apple Login (Initiate Supabase OAuth Flow)
  const handleAppleLogin = async () => {
    setAppleLoading(true);
    setError(null);

    if (!supabase) {
      setError("Authentication service is not available.");
      setAppleLoading(false);
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (oauthError) {
        throw new Error(oauthError.message || "Could not start Apple Sign-In.");
      }
    } catch (err) {
      console.error("Apple Login Initiation Error:", err);
      setError(err.message || "Failed to connect with Apple.");
      setAppleLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to Home</span>
      </Link>

      <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
      <p className="text-gray-600 mb-6">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-indigo-600 hover:text-indigo-800"
        >
          Sign Up
        </Link>
      </p>

      {/* Error Display */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="Email Address"
          />
        </div>

        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            value={formData.password}
            onChange={handleChange}
            required
            aria-label="Password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <Link
            href="/auth/forgot-password"
            className="text-indigo-600 text-sm hover:text-indigo-800"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loginLoading}
          className={`w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out ${
            loginLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loginLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center justify-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className={`w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-100 mb-3 transition-all duration-200 ease-in-out ${
          googleLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FcGoogle className="text-xl" />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      {/* Apple Login Button */}
      <button
        type="button"
        onClick={handleAppleLogin}
        disabled={appleLoading}
        className={`w-full flex items-center justify-center p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200 ease-in-out ${
          appleLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Apple Icon SVG */}
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
        </svg>
        {appleLoading ? "Connecting..." : "Continue with Apple"}
      </button>
    </AuthLayout>
  );
};

export default Login;
