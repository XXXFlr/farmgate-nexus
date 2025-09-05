import React from 'react';

export const VendorsSection = () => {
  return (
    <div className="mb-4 md:mb-6">
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4 px-1">Vendors</h3>
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide mobile-scroll">
        {[1, 2, 3, 4].map((vendor) => (
          <div key={vendor} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px]">
            {/* Vendor Avatar with responsive sizing */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 via-blue-400 to-green-500 p-1 mb-2 md:mb-3 shadow-lg touch-target">
              <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center relative overflow-hidden">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full"></div>
              </div>
            </div>
            
            {/* Vendor Info */}
            <span className="text-xs sm:text-sm font-semibold text-foreground text-center line-clamp-1">
              [Display Name]
            </span>
            <span className="text-xs text-muted-foreground text-center">
              type
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};