import React from 'react';
import Image from 'next/image';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Lorem ipsum dolor sit amet consectetur. Dictum felis urna molestie purus auctor rutrum. Consequat a donec viverra ut ultrices leo eget nunc.",
      name: "Rudra Ghosh",
      role: "Lorem Ipsum",
      avatar: "/images/student_image.png",
      rating: 5
    },
    {
      id: 2,
      quote: "Lorem ipsum dolor sit amet consectetur. Fames lacus pulvinar venenatis lectus sem. Sagittis lectus quis feugiat ut est id magna quam.",
      name: "Rudra Ghosh",
      role: "Lorem Ipsum",
      avatar: "/images/student_image.png",
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-16">Reviews</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col justify-center">
            <div className="text-3xl font-bold">
              <span className="block mb-2">What Our</span>
              <span className="block text-cyan-500 mb-2">Students</span>
              <span className="block">Say About Us</span>
            </div>
          </div>
          
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-gray-700 mb-6">{testimonial.quote}</p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 relative bg-gray-200">
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 