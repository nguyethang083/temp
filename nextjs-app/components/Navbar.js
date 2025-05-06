import React, { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white py-4 relative z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-gray-800">E-learning</span><span className="text-indigo-500">•</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
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
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-gray-600 focus:outline-none focus:text-indigo-500"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Log In
          </Link>
          <Link href="/auth/signup" className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-200 transition duration-300 font-medium">
            Sign up
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu (Popup) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border-t z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-indigo-500 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/courses" 
                className="text-gray-600 hover:text-indigo-500 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>
              <Link 
                href="/mentor" 
                className="text-gray-600 hover:text-indigo-500 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Mentor
              </Link>
              <Link 
                href="/community" 
                className="text-gray-600 hover:text-indigo-500 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-indigo-500 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
              
              <div className="flex flex-col space-y-3 pt-2">
                <Link 
                  href="/auth/login" 
                  className="text-indigo-600 hover:text-indigo-800 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-200 transition duration-300 font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 