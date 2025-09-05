import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MapPin, Store, Truck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  activeIndex: number;
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: 'Home', path: '/', activeIndex: 0 },
  { icon: MapPin, label: 'Map', path: '/map', activeIndex: 1 },
  { icon: Store, label: 'Markets', path: '/markets', activeIndex: 2 },
  { icon: Truck, label: 'Vendors', path: '/vendors', activeIndex: 3 },
  { icon: MessageSquare, label: 'Chat', path: '/chat', activeIndex: 4 },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-border z-50 md:hidden h-16">
      <div className="flex items-center justify-around h-full py-2">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent transition-colors ${
                active 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-200'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}