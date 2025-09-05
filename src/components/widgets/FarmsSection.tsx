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
      <div className="flex overflow-x-auto scrollbar-hide mobile-scroll -mx-4 px-4">
        {farmUsers.map((farmUser) => (
          <div key={farmUser.id} className="flex-shrink-0 pr-3 first:pl-0 last:pr-4">
            <div 
              className="bg-card rounded-xl animate-fade-in border border-border shadow-sm w-40 sm:w-44 md:w-48"
              style={{
                minHeight: '240px',
              }}
            >
              {/* Card Content with responsive padding */}
              <div className="p-3 h-full">
                <div className="flex flex-col h-full items-start">
                  {/* Farm Image */}
                  <div className="w-full mb-3">
                    <img
                      src={farmUser.photo_url || 'https://clqwofdhiwlqnwqshzfk.supabase.co/storage/v1/object/public/market-photos/HawaiiFarm.png'}
                      alt={farmUser.display_name || 'Farm'}
                      className="w-full h-24 sm:h-28 md:h-32 object-cover object-top rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://clqwofdhiwlqnwqshzfk.supabase.co/storage/v1/object/public/market-photos/HawaiiFarm.png';
                      }}
                    />
                  </div>
                  
                  {/* Farm Name */}
                  <div className="flex-1 mb-3">
                    <h4 
                      className="text-foreground text-sm sm:text-base font-normal leading-tight line-clamp-2"
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
                  <div className="flex items-center justify-between w-full">
                    <span 
                      className="text-muted-foreground text-xs font-medium"
                      style={{ 
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        letterSpacing: '0.0px'
                      }}
                    >
                      View Now
                    </span>
                    <ChevronRight 
                      className="w-4 h-4 text-foreground flex-shrink-0" 
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