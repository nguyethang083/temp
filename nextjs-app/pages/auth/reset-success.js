import React from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';
import { CheckCircle } from 'react-feather';

const ResetSuccess = () => {
  const router = useRouter();
  
  return (
    <AuthLayout title="Reset Password - Step 2">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle size={36} className="text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-semibold mb-4">Password reset successfully</h1>
        
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors mt-6"
        >
          Login
        </button>
      </div>
    </AuthLayout>
  );
};

export default ResetSuccess; 