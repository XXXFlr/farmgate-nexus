import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "./pages/HomePage";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import Markets from "./pages/Markets";
import CreateMarket from "./pages/CreateMarket";
import MarketDetails from "./pages/MarketDetails";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import ProductDetails from "./pages/ProductDetails";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProducts from "./pages/VendorProducts";
import Search from "./pages/Search";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useFirebaseAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<Search />} />
        
        {/* Market Routes */}
        <Route path="/markets" element={<Markets />} />
        <Route path="/markets/create" element={<CreateMarket />} />
        <Route path="/markets/:marketId" element={<MarketDetails />} />
        
        {/* Product Routes */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/create" element={<CreateProduct />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        
        {/* User Routes */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        
        {/* Event Routes */}
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/edit-event/:marketId" element={<EditEvent />} />
        
        {/* Other Routes */}
        <Route path="/map" element={<Map />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;
