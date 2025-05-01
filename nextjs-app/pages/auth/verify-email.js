import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft } from 'react-feather';

const VerifyEmail = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get email from localStorage if available
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
    }
    
    // Check if this is a verification callback from Supabase
    const { type } = router.query;
    
    if (type === 'signup' || type === 'email_confirmation') {
      handleSupabaseEmailVerification();
    }
  }, [router.query]);
  
  const handleSupabaseEmailVerification = async () => {
    try {
      setVerifying(true);
      setError('');
      
      // Check if the user is verified by getting the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(sessionError.message || 'Failed to check verification status');
      }
      
      if (session?.user?.email_confirmed_at) {
        // Email is verified
        setVerified(true);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        // Not verified yet
        throw new Error('Email verification not completed. Please check your email and click the verification link.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during email verification');
    } finally {
      setVerifying(false);
    }
  };
  
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!email) {
        throw new Error('Email address is required');
      }
      
      // Use Supabase to resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email?type=signup`
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to resend verification email');
      }
      
      // Show success message
      alert('Verification email has been resent. Please check your inbox.');
      
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
      {/* Back to Home Link */}
      {!verified && (
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Home</span>
        </Link>
      )}
      
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