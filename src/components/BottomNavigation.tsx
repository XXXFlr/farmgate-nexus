import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Plus, List, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M3 17h2l.5-2h13l.5 2h2l-2-7H5l-2 7zm3.5-5h11l-.5 2h-10l-.5-2z"/>
      <path d="M6 18.5A1.5 1.5 0 1 0 7.5 20 1.5 1.5 0 0 0 6 18.5zm10 0A1.5 1.5 0 1 0 17.5 20 1.5 1.5 0 0 0 16 18.5z"/>
      <path d="M8 14h8v-2H8v2zm0-3h8V9H8v2z"/>
    </svg>
  ), label: 'Vendors', path: '/vendors' },
  { icon: List, label: 'Markets', path: '/markets' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
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