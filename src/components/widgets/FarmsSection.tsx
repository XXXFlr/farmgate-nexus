import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FarmUser {
  id: string;
  display_name: string | null;
  photo_url: string | null;
}

interface FarmsSectionProps {
  farmUsers: FarmUser[];
  loading: boolean;
}

export const FarmsSection: React.FC<FarmsSectionProps> = ({ farmUsers, loading }) => {
  if (loading) {
    return (
      <div className="py-2 mb-4 md:mb-6">
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1 px-0 mb-4 md:mb-6">
      <div className="flex overflow-x-auto scrollbar-hide mobile-scroll">
        {farmUsers.map((farmUser) => (
          <div key={farmUser.id} className="px-2 sm:px-4 py-2 first:pl-4 last:pr-4 flex-shrink-0">
            <div 
              className="bg-card rounded-xl animate-fade-in border border-border shadow-sm"
              style={{
                width: '180px',
                minHeight: '280px',
              }}
            >
              {/* Card Content with responsive padding */}
              <div className="p-2 sm:p-3 h-full">
                <div className="flex flex-col h-full items-start">
                  {/* Farm Image */}
                  <div className="w-full mb-3 sm:mb-4">
                    <img
                      src={farmUser.photo_url || 'https://clqwofdhiwlqnwqshzfk.supabase.co/storage/v1/object/public/market-photos/HawaiiFarm.png'}
                      alt={farmUser.display_name || 'Farm'}
                      className="w-full object-cover object-top rounded-lg"
                      style={{ 
                        height: '140px',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://clqwofdhiwlqnwqshzfk.supabase.co/storage/v1/object/public/market-photos/HawaiiFarm.png';
                      }}
                    />
                  </div>
                  
                  {/* Farm Name */}
                  <div className="mb-auto">
                    <h4 
                      className="text-foreground text-base sm:text-lg font-normal leading-tight line-clamp-2"
                      style={{ 
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '0.0px',
                        margin: 0
                      }}
                    >
                      {farmUser.display_name || 'Display Name'}
                    </h4>
                  </div>
                  
                  {/* View Now Row */}
                  <div className="flex items-center justify-between w-full mt-3 sm:mt-4">
                    <span 
                      className="text-muted-foreground text-xs sm:text-sm font-medium"
                      style={{ 
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        letterSpacing: '0.0px'
                      }}
                    >
                      View Now
                    </span>
                    <ChevronRight 
                      className="w-5 h-5 sm:w-6 sm:h-6 text-foreground flex-shrink-0" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};