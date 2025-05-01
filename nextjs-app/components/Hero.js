import React from 'react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="py-10 bg-[#F6FAFF]">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-5/12 mb-10 md:mb-0 order-1 md:order-1 md:ml-[8%]">
          <div>
            <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-4 py-1 rounded-full text-sm mb-2">
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </span>
              GET 30% OFF ON FIRST ENROLL
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-2 mb-4">
              Advance your <br />mathematics skills<br />with us.
            </h1>
            <p className="text-gray-600 mb-6">
              Build skills with our exercises and mentor from world-class universities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-primary border border-gray-200 px-8 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300 font-medium">
                Get your Action Plan!
              </button>
            </div>
            
            <div className="flex mt-8 gap-8">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Exam-Focused</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Structured Learning Path</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-5/12 relative order-2 md:order-2 md:mr-[8%]">
          <div className="relative h-[400px] w-full">
            <Image 
              src="/images/header.png" 
              alt="Student with books" 
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'contain' }}
              className="z-10 relative"
            />
            <div className="absolute w-60 h-60 bg-blue-100 rounded-full -top-10 -right-10 z-0"></div>
            <div className="absolute w-40 h-40 bg-yellow-100 rounded-full bottom-10 left-10 z-0"></div>
            
            {/* No of students chart */}
            <div className="absolute right-14 top-4 bg-white p-3 rounded-lg shadow-lg z-20">
              <div className="text-xs text-gray-500 mb-1">No of students</div>
              <div className="flex items-end space-x-1 h-16">
                <div className="w-3 h-8 bg-blue-400 rounded-t-sm"></div>
                <div className="w-3 h-12 bg-blue-300 rounded-t-sm"></div>
                <div className="w-3 h-10 bg-yellow-400 rounded-t-sm"></div>
                <div className="w-3 h-14 bg-green-400 rounded-t-sm"></div>
              </div>
            </div>
            
            {/* 50+ Available courses */}
            <div className="absolute left-10 top-32 bg-white p-3 rounded-lg shadow-lg z-20 flex items-center">
              <div className="bg-cyan-500 text-white p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm">50+</div>
                <div className="text-xs text-gray-500">Available courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 