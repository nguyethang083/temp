import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-4 left-4 text-gray-500 text-sm">{title}</div>
      <div className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="w-1/2 relative overflow-hidden">
          {/* Hình ảnh background */}
          <div className="absolute inset-0">
            <Image 
              src="/images/auth_back.jpg" 
              alt="E-learning illustration" 
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          {/* Logo overlay */}
          <div className="absolute top-6 left-6 z-10">
            <Link href="/" className="flex items-center text-white text-2xl font-bold">
              <div className="flex items-center">
                <div className="mr-2">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
                    <path d="M10 14L20 20L30 14" stroke="white" strokeWidth="2" />
                    <path d="M20 20V32" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                E-learning
              </div>
            </Link>
          </div>
          
          {/* Đường kẻ trang trí (giữ lại) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/5 z-10">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-full w-px bg-blue-300 opacity-30"
                style={{ right: `${i * 15}px` }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Right side - Content */}
        <div className="w-1/2 flex items-center justify-center p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 