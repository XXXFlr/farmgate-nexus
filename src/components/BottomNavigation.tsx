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
  { icon: Map, label: 'Explore', path: '/map' },
  { icon: Plus, label: 'Add', path: '/add-event' },
  { icon: List, label: 'List', path: '/my-products' },
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
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-transparent ${
                active 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-200'
              }`}
            >
              <item.icon className="h-7 w-7" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}