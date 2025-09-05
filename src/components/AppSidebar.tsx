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
  Moon,
  FileText,
  Package
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
  { title: 'Account', url: '/account', icon: MapPin },
  { title: 'Edit Profile', url: '/profile', icon: User },
  { title: 'Documents', url: '/documents', icon: FileText },
  { title: 'My Products', url: '/my-products', icon: Package },
  { title: 'Hosting', url: '/my-markets', icon: Store },
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
          <div className="p-4 bg-sidebar-background border-b border-sidebar-border">
            {!collapsed && (
              <div className="flex justify-start mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/qr-share')}
                  className="w-9 h-10 p-0 bg-background border-border"
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <div className={`flex ${collapsed ? 'justify-center' : 'flex-col items-center'} mb-4`}>
              <Avatar 
                className={`${collapsed ? 'w-8 h-8' : 'w-24 h-24'} border-2 border-emerald-500 cursor-pointer bg-emerald-50`}
                onClick={() => navigate('/profile')}
              >
                <AvatarImage 
                  src={user?.photoURL || 'https://eeqmvfbsupumublzxlil.supabase.co/storage/v1/object/public/roots//man.png'} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="w-full mt-3">
                  <h3 className="text-left text-2xl font-medium text-sidebar-foreground ml-0">
                    {user?.displayName || 'Display Name'}
                  </h3>
                  <p className="text-left text-lg text-sidebar-foreground/70 ml-0 mt-1">
                    @{user?.email?.split('@')[0] || 'username'}
                  </p>
                  <div className="flex justify-start gap-5 mt-2 text-sm text-sidebar-foreground/80 ml-0">
                    <span><strong className="font-semibold">123</strong> <span className="font-medium">Followers</span></span>
                    <span><strong className="font-semibold">123</strong> <span className="font-medium">Following</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title} className="mt-6 first:mt-0">
                      <SidebarMenuButton asChild className="p-0">
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-0 py-2 transition-colors ${
                              isActive
                                ? 'text-sidebar-primary'
                                : 'text-sidebar-foreground hover:text-sidebar-primary'
                            }`
                          }
                        >
                          <item.icon className="h-7 w-7 text-sidebar-primary" />
                          {!collapsed && <span className="text-xl font-semibold">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  <SidebarMenuItem className="mt-6">
                    <SidebarMenuButton onClick={handleVerification} className="p-0">
                      <CheckCircle className="h-7 w-7 text-sidebar-primary" />
                      {!collapsed && <span className="text-xl font-semibold ml-3">Verification</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* Location Toggle */}
          {!collapsed && (
            <div className="px-4 py-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-7 w-7 text-red-500" />
                  <span className="text-xl font-semibold text-sidebar-foreground">Mark Location</span>
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
        <div className="p-4 border-t border-sidebar-border">
          {/* Logout Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleLogout}
              variant="default"
              className="min-w-[90px] h-10 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
              size={collapsed ? "icon" : "default"}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Log Out</span>}
            </Button>
          </div>

          {/* Theme Toggle */}
          {!collapsed && (
            <div className="flex items-start">
              <div className="flex bg-sidebar-background border border-sidebar-border rounded-xl p-1 w-[90px] h-9">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(false)}
                  className={`flex-1 h-7 rounded-lg ${!isDarkMode ? 'bg-sidebar-accent border border-sidebar-border' : ''}`}
                >
                  <Sun className="h-4 w-4 text-black" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(true)}
                  className={`flex-1 h-7 rounded-lg ${isDarkMode ? 'bg-sidebar-foreground border border-sidebar-border' : ''}`}
                >
                  <Moon className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}