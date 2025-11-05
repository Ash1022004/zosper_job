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
      const me = await apiMe();
      const ok = !!me?.user && me.user.role === 'admin';
      setState({ loading: false, ok });
    })();
  }, []);
  if (state.loading) return null;
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
