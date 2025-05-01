import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-gray-800">E-learning</span><span className="text-indigo-500">•</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-600 hover:text-indigo-500 border-b-2 border-indigo-500 pb-1">
            Home
          </Link>
          <Link href="/courses" className="text-gray-600 hover:text-indigo-500">
            Courses
          </Link>
          <Link href="/mentor" className="text-gray-600 hover:text-indigo-500">
            Mentor
          </Link>
          <Link href="/community" className="text-gray-600 hover:text-indigo-500">
            Community
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-indigo-500">
            About us
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Log In
          </Link>
          <Link href="/auth/signup" className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-200 transition duration-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 