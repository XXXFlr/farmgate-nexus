import React, { createContext, useContext, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showBottomNav?: boolean;
  title?: string;
}

export function AppLayout({ 
  children, 
  showSidebar = true, 
  showBottomNav = true,
  title = 'Farmers Markets'
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen) }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Desktop Sidebar */}
          {showSidebar && (
            <div className="hidden md:block">
              <AppSidebar />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card sticky top-0 z-40">
              <div className="flex items-center gap-3">
                {showSidebar && (
                  <SidebarTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SidebarTrigger>
                )}
                <h1 className="text-xl font-bold text-foreground">{title}</h1>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className={showBottomNav ? 'pb-20 md:pb-0' : ''}>
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Sidebar */}
          {showSidebar && (
            <div className="md:hidden">
              <AppSidebar />
            </div>
          )}
        </div>

        {/* Bottom Navigation for Mobile */}
        {showBottomNav && <BottomNavigation />}
      </SidebarProvider>
    </SidebarContext.Provider>
  );
}