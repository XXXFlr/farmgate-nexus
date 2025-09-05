import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 md:mb-6">
      <div 
        className="w-full rounded-xl p-3 sm:p-4 md:p-6"
        style={{
          backgroundColor: 'rgba(15, 17, 19, 0.26)',
        }}
      >
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Title Section */}
          <div>
            <h2 
              className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-tight"
              style={{
                fontFamily: 'Outfit, sans-serif',
                textShadow: '3px 3px 3px rgba(0,0,0,0.3)'
              }}
            >
              Local harvest<br />Local people
            </h2>
          </div>
          
          {/* Description */}
          <div>
            <p 
              className="text-white text-xs sm:text-sm md:text-base font-normal"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Get to Know Nearby Farmers and Discover Their Unique Stories!
            </p>
          </div>
          
          {/* User Avatars */}
          <div className="flex items-center gap-1">
            {[
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60',
              'https://images.unsplash.com/photo-1533689476487-034f57831a58?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTA4fHx1c2VyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=900&q=60',
              'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTE1fHx1c2VyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=900&q=60'
            ].map((src, index) => (
              <button 
                key={index}
                className="mr-1 touch-target flex-shrink-0"
                onClick={() => navigate('/news')}
              >
                <img 
                  src={src}
                  alt="User"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* CTA Button */}
          <Button
            onClick={() => navigate('/news')}
            className="w-full h-9 sm:h-10 md:h-11 bg-primary text-white text-xs sm:text-sm md:text-base font-normal rounded-xl shadow-sm border border-transparent touch-target"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Explore Now
          </Button>
        </div>
      </div>
    </div>
  );
};