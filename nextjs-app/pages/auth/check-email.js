import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';

const CheckEmail = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get email from localStorage if available
    const resetEmail = localStorage.getItem('resetEmail');
    if (resetEmail) {
      setEmail(resetEmail);
    }
  }, []);
  
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call to Frappe backend to resend reset email
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend reset email');
      }
      
      // Show success message or update UI
      alert('Password reset email has been resent');
      
    } catch (err) {
      setError(err.message || 'An error occurred when resending the email');
    } finally {
      setLoading(false);
    }
  };
  
  // Mask email for display
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };
  
  return (
    <AuthLayout title="Forgot Password - Step 2">
      <h1 className="text-3xl font-semibold mb-4">Check your Email</h1>
      
      <p className="text-gray-600 mb-8">
        We have sent an email with password reset information to {maskEmail(email)}.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <p className="text-gray-600">Didn't receive the email? Check spam or promotion folder or</p>
      </div>
      
      <button
        type="button"
        onClick={handleResendEmail}
        disabled={loading}
        className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors mb-4"
      >
        {loading ? 'Sending...' : 'Resend Email'}
      </button>
      
      <button
        type="button"
        onClick={() => router.push('/auth/login')}
        className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-colors"
      >
        Back to Login
      </button>
    </AuthLayout>
  );
};

export default CheckEmail; 