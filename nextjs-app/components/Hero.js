import React from 'react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="py-8 md:py-10 bg-[#F6FAFF]">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Text Content - On mobile, appears first, on tablet/desktop appears on left */}
        <div className="w-full md:w-1/2 lg:w-5/12 mb-8 md:mb-0 order-2 md:order-1 md:pr-4 lg:ml-[8%]">
          <div>
            <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </span>
              <span className="truncate">GET 30% OFF ON FIRST ENROLL</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-gray-800 mt-2 mb-3 md:mb-4">
              Advance your <br className="hidden sm:block" />
              mathematics skills<br className="hidden sm:block" />
              with us.
            </h1>
            <p className="text-gray-600 mb-5 md:mb-6 text-sm sm:text-base">
              Build skills with our exercises and mentor from world-class universities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="bg-white text-primary border border-gray-200 px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-md hover:shadow-lg transition duration-300 font-medium text-sm sm:text-base">
                Get your Action Plan!
              </button>
            </div>
            
            <div className="flex flex-wrap mt-6 md:mt-8 gap-4 sm:gap-8">
              <div className="flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-gray-700 text-sm sm:text-base">Exam-Focused</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-gray-700 text-sm sm:text-base">Structured Learning Path</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image Content - On mobile, appears second, on tablet/desktop appears on right */}
        <div className="w-full md:w-1/2 lg:w-5/12 relative order-1 md:order-2 md:pl-4 lg:mr-[8%]">
          <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
            <Image 
              src="/images/header.png" 
              alt="Student with books" 
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 40vw"
              style={{ objectFit: 'contain' }}
              className="z-10 relative"
              priority
            />
            {/* Background circles - responsive sizes */}
            <div className="absolute w-40 h-40 sm:w-50 sm:h-50 md:w-60 md:h-60 bg-blue-100 rounded-full -top-5 -right-5 sm:-top-8 sm:-right-8 md:-top-10 md:-right-10 z-0"></div>
            <div className="absolute w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-yellow-100 rounded-full bottom-5 left-5 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10 z-0"></div>
            
            {/* No of students chart - adjust position for different screens */}
            <div className="absolute right-2 sm:right-5 md:right-10 lg:right-14 top-0 sm:top-2 md:top-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg z-20">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">No of students</div>
              <div className="flex items-end space-x-1 h-10 sm:h-12 md:h-16">
                <div className="w-2 sm:w-3 h-5 sm:h-8 bg-blue-400 rounded-t-sm"></div>
                <div className="w-2 sm:w-3 h-7 sm:h-12 bg-blue-300 rounded-t-sm"></div>
                <div className="w-2 sm:w-3 h-6 sm:h-10 bg-yellow-400 rounded-t-sm"></div>
                <div className="w-2 sm:w-3 h-8 sm:h-14 bg-green-400 rounded-t-sm"></div>
              </div>
            </div>
            
            {/* 50+ Available courses - adjust position for different screens */}
            <div className="absolute left-2 sm:left-5 md:left-10 bottom-0 sm:bottom-4 md:bottom-10 bg-white p-2 sm:p-3 rounded-lg shadow-lg z-20 flex items-center">
              <div className="bg-cyan-500 text-white p-1 rounded mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">50+</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Available courses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 