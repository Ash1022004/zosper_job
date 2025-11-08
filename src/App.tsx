import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import UserLogin from "./pages/UserLogin";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useEffect, useState } from "react";
import { apiMe } from "./lib/api";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FeedbackPanel from "./components/FeedbackPanel";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<{ loading: boolean; ok: boolean }>(() => ({ loading: true, ok: false }));
  useEffect(() => {
    (async () => {
      try {
        // Add longer delay to ensure cookie is available after page reload
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[RequireAdmin] Checking authentication...');
        console.log('[RequireAdmin] Cookies:', document.cookie);
        console.log('[RequireAdmin] Admin token in localStorage:', localStorage.getItem('admin_token'));
        
        const me = await apiMe();
        console.log('[RequireAdmin] apiMe response:', me);
        console.log('[RequireAdmin] User object:', me?.user);
        console.log('[RequireAdmin] User role:', me?.user?.role);
        console.log('[RequireAdmin] User isAdmin:', me?.user?.isAdmin);
        
        // Check both role and isAdmin for compatibility
        const ok = !!me?.user && (me.user.role === 'admin' || me.user.isAdmin === true);
        console.log('[RequireAdmin] Is admin?', ok);
        
        if (!ok && me?.user) {
          console.warn('[RequireAdmin] User exists but is not admin:', me.user);
        }
        
        setState({ loading: false, ok });
      } catch (error) {
        console.error('[RequireAdmin] Auth check failed:', error);
        setState({ loading: false, ok: false });
      }
    })();
  }, []);
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  return state.ok ? <>{children}</> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <FeedbackPanel />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
