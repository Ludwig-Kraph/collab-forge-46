import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Payment = lazy(() => import("./pages/Payment"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Ledger = lazy(() => import("./pages/Ledger"));
const Analytics = lazy(() => import("./pages/Analytics"));
const More = lazy(() => import("./pages/More"));
import { AdminRoute } from '@/components/auth/AdminRoute';
import { SuperAdminRoute } from '@/components/auth/SuperAdminRoute';
import Users from '@/pages/Users';
import ControlPanel from '@/pages/ControlPanel';
import Accounts from '@/pages/control-panel/Accounts';
import Onboarding from '@/pages/control-panel/Onboarding';
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Help = lazy(() => import("./pages/Help"));
const HowTo = lazy(() => import("./pages/HowTo"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
              </div>
            }>
              <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/control-panel" element={<SuperAdminRoute><ControlPanel /></SuperAdminRoute>} />
            <Route path="/control-panel/accounts" element={<SuperAdminRoute><Accounts /></SuperAdminRoute>} />
            <Route path="/control-panel/onboarding" element={<SuperAdminRoute><Onboarding /></SuperAdminRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/how-to" element={<ProtectedRoute><HowTo /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
