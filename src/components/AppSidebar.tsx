import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Store, 
  CheckCircle, 
  LogOut,
  QrCode,
  Sun,
  Moon
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { title: 'Account', url: '/account', icon: User },
  { title: 'Edit Profile', url: '/profile', icon: Edit3 },
  { title: 'My Markets', url: '/my-markets', icon: Store },
  { title: 'Saved Markets', url: '/saved-markets', icon: Calendar },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useFirebaseAuth();
  const { toast } = useToast();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerification = () => {
    toast({
      title: 'Coming soon',
      description: 'Verification feature will be available soon.',
    });
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-80'} collapsible="icon">
      <SidebarContent className="flex flex-col justify-between h-full">
        <div className="flex-1">
          {/* User Profile Section */}
          <div className="p-4 border-b border-border">
            {!collapsed && (
              <div className="flex justify-start mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/qr-share')}
                  className="w-10 h-10 p-0"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <div className={`flex ${collapsed ? 'justify-center' : 'flex-col items-center'} mb-4`}>
              <Avatar 
                className={`${collapsed ? 'w-8 h-8' : 'w-20 h-20'} border-2 border-primary cursor-pointer`}
                onClick={() => navigate('/profile')}
              >
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="text-center mt-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {user?.displayName || 'Display Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{user?.email?.split('@')[0] || 'username'}
                  </p>
                  <div className="flex justify-center gap-4 mt-2 text-sm">
                    <span><strong>123</strong> Followers</span>
                    <span><strong>123</strong> Following</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleVerification}>
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {!collapsed && <span className="font-medium">Verification</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Location Toggle */}
          {!collapsed && (
            <div className="px-4 py-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-destructive" />
                  <span className="font-medium">Mark Location</span>
                </div>
                <Switch
                  checked={locationEnabled}
                  onCheckedChange={setLocationEnabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border">
          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="default"
            className="w-full mb-4"
            size={collapsed ? "icon" : "default"}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Log Out</span>}
          </Button>

          {/* Theme Toggle */}
          {!collapsed && (
            <div className="flex items-center justify-start">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={!isDarkMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsDarkMode(false)}
                  className="rounded-md"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={isDarkMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsDarkMode(true)}
                  className="rounded-md"
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}