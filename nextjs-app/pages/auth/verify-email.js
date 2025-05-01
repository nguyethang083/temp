import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';
import { parseCookies } from 'nookies';

const VerifyEmail = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get email from cookies if available
    const cookies = parseCookies();
    if (cookies.userEmail) {
      setEmail(cookies.userEmail);
    }
    
    // Check if there's a token in the URL for verification
    const { token } = router.query;
    if (token) {
      verifyEmailWithToken(token);
    }
  }, [router.query]);
  
  const verifyEmailWithToken = async (token) => {
    try {
      setVerifying(true);
      setError('');
      
      // Call API to verify email with token
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email');
      }
      
      // Email verified successfully
      setVerified(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'An error occurred during email verification');
    } finally {
      setVerifying(false);
    }
  };
  
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call to Frappe backend to resend verification email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }
      
      // Show success message or update UI
      alert('Verification email has been resent');
      
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
    <AuthLayout title="Email Verification">
      {verifying ? (
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Verifying your email...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : verified ? (
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Email Verified</h1>
          <p className="text-green-600 mb-8">
            Your email has been verified successfully. Redirecting to login...
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold mb-4">Verify your Email</h1>
          
          <p className="text-gray-600 mb-8">
            We have sent a verification email to {maskEmail(email)}.
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
            className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </button>
        </>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail; 