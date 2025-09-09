import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Star,
  Settings,
  LogOut,
  Menu,
  UserPlus
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const getRoleNavigation = (role, hasStore) => {
  switch (role) {
    case "admin":
      return [
        { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
        { title: "Users", url: createPageUrl("UserManagement"), icon: Users },
        { title: "Stores", url: createPageUrl("StoreManagement"), icon: Store },
      ];
    case "user":
      if (hasStore) {
        return [
          { title: "My Store Dashboard", url: createPageUrl("StoreDashboard"), icon: LayoutDashboard },
          { title: "Browse Stores", url: createPageUrl("BrowseStores"), icon: Store },
          { title: "My Ratings", url: createPageUrl("MyRatings"), icon: Star },
          { title: "Profile", url: createPageUrl("UserProfile"), icon: Settings },
        ];
      } else {
        return [
          { title: "Browse Stores", url: createPageUrl("BrowseStores"), icon: Store },
          { title: "My Ratings", url: createPageUrl("MyRatings"), icon: Star },
          { title: "Profile", url: createPageUrl("UserProfile"), icon: Settings },
        ];
      }
    default:
      return [
        { title: "Browse Stores", url: createPageUrl("BrowseStores"), icon: Store },
        { title: "My Ratings", url: createPageUrl("MyRatings"), icon: Star },
        { title: "Profile", url: createPageUrl("UserProfile"), icon: Settings },
      ];
  }
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [hasStore, setHasStore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const [currentUser, { Store }] = await Promise.all([
          User.me(),
          import('@/entities/Store')
        ]);
        setUser(currentUser);
        
        // Check if user has a store
        const stores = await Store.list();
        const userStore = stores.find(s => s.owner_id === currentUser.id);
        setHasStore(!!userStore);
      } catch (error) {
        console.log("User not authenticated");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Rating Platform</h1>
              <p className="text-gray-600 mb-6">Rate and discover amazing stores</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => User.login()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Login with Google
                </Button>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-sm text-gray-500">or</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                
                <Link to={createPageUrl("Registration")}>
                  <Button 
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = getRoleNavigation(user.role, hasStore);
  const roleDisplayName = user.role === 'admin' ? 'Administrator' : hasStore ? 'Store Owner' : 'User';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Store Rating</h2>
                <p className="text-xs text-gray-500">Platform</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                {roleDisplayName} Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{roleDisplayName}</p>
                </div>
              </div>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-xl font-bold text-gray-900">Store Rating Platform</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}