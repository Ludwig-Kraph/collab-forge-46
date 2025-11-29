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
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from '@/components/auth/AdminRoute';
import { SuperAdminRoute } from '@/components/auth/SuperAdminRoute';
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
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Help = lazy(() => import("./pages/Help"));
const HowTo = lazy(() => import("./pages/HowTo"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Heavy components - lazy load
const Users = lazy(() => import('@/pages/Users'));
const ControlPanel = lazy(() => import('@/pages/ControlPanel'));
const Accounts = lazy(() => import('@/pages/control-panel/Accounts'));
const Onboarding = lazy(() => import('@/pages/control-panel/Onboarding'));
const Support = lazy(() => import('@/pages/control-panel/Support'));
const Communication = lazy(() => import('@/pages/control-panel/Communication'));
const SystemSettings = lazy(() => import('@/pages/control-panel/SystemSettings'));
const Government = lazy(() => import('@/pages/control-panel/Government'));
const SubscriptionControl = lazy(() => import('@/pages/control-panel/SubscriptionControl'));
const LandingPageBuilder = lazy(() => import('@/pages/control-panel/LandingPageBuilder'));
const SuperAdminManagement = lazy(() => import('@/pages/control-panel/SuperAdminManagement'));
const SubscriptionOutlets = lazy(() => import('@/pages/subscription/Outlets'));
const SubscriptionStaff = lazy(() => import('@/pages/subscription/Staff'));
const SubscriptionDepartments = lazy(() => import('@/pages/subscription/Departments'));
const CashierDashboard = lazy(() => import('@/pages/CashierDashboard'));
const GovLanding = lazy(() => import('@/pages/government/GovLanding'));
const NationalDashboard = lazy(() => import('@/pages/government/NationalDashboard'));
const CountyDashboard = lazy(() => import('@/pages/government/CountyDashboard'));
const InterGovernmental = lazy(() => import('@/pages/government/InterGovernmental'));
const MpesaDarajaSettings = lazy(() => import('@/pages/MpesaDarajaSettings'));
const SubscriptionAnalytics = lazy(() => import('@/pages/analytics/SubscriptionAnalytics'));
const SubscriptionCMS = lazy(() => import('@/pages/cms/SubscriptionCMS'));

// Initialize QueryClient with aggressive caching for millisecond load times
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute - more aggressive caching
      gcTime: 10 * 60 * 1000, // 10 minutes - longer cache lifetime
      refetchOnWindowFocus: false,
      retry: 2,
      refetchOnMount: false, // Don't refetch if data is fresh
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
            <Route path="/analytics" element={<ProtectedRoute><SubscriptionAnalytics /></ProtectedRoute>} />
            <Route path="/analytics/basic" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/cms" element={<AdminRoute><SubscriptionCMS /></AdminRoute>} />
            <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/control-panel" element={<SuperAdminRoute><ControlPanel /></SuperAdminRoute>} />
            <Route path="/control-panel/accounts" element={<SuperAdminRoute><Accounts /></SuperAdminRoute>} />
            <Route path="/control-panel/onboarding" element={<SuperAdminRoute><Onboarding /></SuperAdminRoute>} />
            <Route path="/control-panel/support" element={<SuperAdminRoute><Support /></SuperAdminRoute>} />
            <Route path="/control-panel/communication" element={<SuperAdminRoute><Communication /></SuperAdminRoute>} />
            <Route path="/control-panel/subscriptions" element={<SuperAdminRoute><SubscriptionControl /></SuperAdminRoute>} />
            <Route path="/control-panel/landing-builder" element={<SuperAdminRoute><LandingPageBuilder /></SuperAdminRoute>} />
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
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
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
