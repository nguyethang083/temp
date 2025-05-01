import React from 'react';
import Image from 'next/image';

const ExamSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-16">Tailored for Math Exams</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <div className="mb-6 w-full h-[288px] overflow-hidden rounded-lg relative">
              <Image
                src="/images/leaving_cert.jpg"
                alt="Leaving Certificate Examination"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="w-full h-full"
              />
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-center">Leaving Certificate Examination</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              We aim to support Irish students preparing for the Leaving Certificate Examination by providing high-quality math resources, practice questions, and expert guidance. Our platform helps students strengthen their understanding of key mathematical concepts and excel in their exams.
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-6 w-full h-[288px] overflow-hidden rounded-lg relative">
              <Image
                src="/images/vietnam_exam.jpg"
                alt="Vietnamese High School Entrance Exam"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className="w-full h-full"
              />
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-center">Vietnamese High School Entrance Exam</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              We support Vietnamese students preparing for the High School Entrance Exam with comprehensive math resources, practice exercises, and detailed explanations. Our platform helps students build a strong mathematical foundation and achieve high results in their exams.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExamSection; 