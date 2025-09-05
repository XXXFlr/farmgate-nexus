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
        <Route path="/market/:marketId" element={<MarketDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/edit-event/:marketId" element={<EditEvent />} />
        <Route path="/map" element={<Map />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/markets/create" element={<CreateMarket />} />
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
