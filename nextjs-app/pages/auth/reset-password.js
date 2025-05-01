import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';
import { Eye, EyeOff } from 'react-feather';

const ResetPassword = () => {
  const router = useRouter();
  const { token, email } = router.query;
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    message: ''
  });

  useEffect(() => {
    // Check if token exists
    if ((!token || !email) && router.isReady) {
      // Redirect to forgot password if no token or email
      router.push('/auth/forgot-password');
    }
  }, [token, email, router]);

  const validatePasswordStrength = (password) => {
    // Kiểm tra độ dài tối thiểu
    if (password.length < 8) {
      return { isStrong: false, message: 'Password must be at least 8 characters long' };
    }

    // Kiểm tra mật khẩu phổ biến
    const commonPasswords = ['password', 'Password', 'PASSWORD', '12345678', 'qwerty', 'admin'];
    if (commonPasswords.includes(password)) {
      return { isStrong: false, message: 'This is a common password. Please choose a stronger one' };
    }

    // Kiểm tra có ít nhất một chữ hoa, một chữ thường và một số
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { 
        isStrong: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }

    // Kiểm tra không chỉ toàn chữ hoa hoặc toàn chữ thường
    if (password === password.toUpperCase() || password === password.toLowerCase()) {
      return { 
        isStrong: false, 
        message: 'Password cannot be all uppercase or all lowercase' 
      };
    }

    // Nếu thêm ký tự đặc biệt thì càng tốt
    if (!hasSpecial) {
      return { 
        isStrong: true, 
        message: 'Strong password! Adding special characters would make it even stronger.' 
      };
    }

    return { isStrong: true, message: 'Strong password!' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Kiểm tra độ mạnh của mật khẩu nếu đang thay đổi trường password
    if (name === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Kiểm tra độ mạnh của mật khẩu
    const strength = validatePasswordStrength(passwordData.password);
    if (!strength.isStrong) {
      setError(strength.message);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call to API to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          email,
          new_password: passwordData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      // Redirect to reset success page
      router.push('/auth/reset-success');
      
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password - Step 1">
      <h1 className="text-3xl font-semibold mb-4">Reset Password</h1>
      
      <p className="text-gray-600 mb-8">
        Choose a new password for your account
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Your new password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={passwordData.password}
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
        
        {passwordData.password && (
          <div className={`mb-4 p-2 text-sm rounded ${passwordStrength.isStrong ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
            {passwordStrength.message}
          </div>
        )}
        
        <div className="mb-6 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your new password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button 
            type="button"
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors mb-4"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-colors"
        >
          Back to Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword; 