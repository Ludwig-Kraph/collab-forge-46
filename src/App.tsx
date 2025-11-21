import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "next-themes";

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
import Support from '@/pages/control-panel/Support';
import Communication from '@/pages/control-panel/Communication';
import SystemSettings from '@/pages/control-panel/SystemSettings';
import Government from '@/pages/control-panel/Government';
import SubscriptionControl from '@/pages/control-panel/SubscriptionControl';
import SuperAdminManagement from '@/pages/control-panel/SuperAdminManagement';
import SubscriptionOutlets from '@/pages/subscription/Outlets';
import SubscriptionStaff from '@/pages/subscription/Staff';
import SubscriptionDepartments from '@/pages/subscription/Departments';
import CashierDashboard from '@/pages/CashierDashboard';
import GovLanding from '@/pages/government/GovLanding';
import NationalDashboard from '@/pages/government/NationalDashboard';
import CountyDashboard from '@/pages/government/CountyDashboard';
import InterGovernmental from '@/pages/government/InterGovernmental';
import MpesaDarajaSettings from '@/pages/MpesaDarajaSettings';
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Help = lazy(() => import("./pages/Help"));
const HowTo = lazy(() => import("./pages/HowTo"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Initialize QueryClient for React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - data is fresh for this period
      gcTime: 5 * 60 * 1000, // 5 minutes - cached data lifetime
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 2, // Retry failed requests twice
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <CookieConsent />
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
            <Route path="/control-panel/support" element={<SuperAdminRoute><Support /></SuperAdminRoute>} />
            <Route path="/control-panel/communication" element={<SuperAdminRoute><Communication /></SuperAdminRoute>} />
            <Route path="/control-panel/subscriptions" element={<SuperAdminRoute><SubscriptionControl /></SuperAdminRoute>} />
            <Route path="/control-panel/settings" element={<SuperAdminRoute><SystemSettings /></SuperAdminRoute>} />
            <Route path="/control-panel/government" element={<SuperAdminRoute><Government /></SuperAdminRoute>} />
            <Route path="/control-panel/super-admins" element={<SuperAdminRoute><SuperAdminManagement /></SuperAdminRoute>} />
            <Route path="/subscription/outlets" element={<AdminRoute><SubscriptionOutlets /></AdminRoute>} />
            <Route path="/subscription/staff" element={<AdminRoute><SubscriptionStaff /></AdminRoute>} />
            <Route path="/subscription/departments" element={<AdminRoute><SubscriptionDepartments /></AdminRoute>} />
            <Route path="/cashier-dashboard" element={<ProtectedRoute><CashierDashboard /></ProtectedRoute>} />
            <Route path="/gov" element={<GovLanding />} />
            <Route path="/gov/national" element={<ProtectedRoute><NationalDashboard /></ProtectedRoute>} />
            <Route path="/gov/county" element={<ProtectedRoute><CountyDashboard /></ProtectedRoute>} />
            <Route path="/gov/cross-gov" element={<ProtectedRoute><InterGovernmental /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/mpesa-daraja" element={<ProtectedRoute><MpesaDarajaSettings /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/how-to" element={<ProtectedRoute><HowTo /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
              </Suspense>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
