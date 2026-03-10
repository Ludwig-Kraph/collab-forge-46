import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from '@/components/auth/AdminRoute';
import { SuperAdminRoute } from '@/components/auth/SuperAdminRoute';
import { ThemeProvider } from "next-themes";
import { lazyWithRetry } from "@/components/LazyLoadRetry";
import LazyLoadErrorBoundary from "@/components/LazyLoadRetry";

// Lazy load pages with retry logic to prevent chunk loading errors
const Landing = lazyWithRetry(() => import("./pages/Landing"));
const Index = lazyWithRetry(() => import("./pages/Index"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Payment = lazyWithRetry(() => import("./pages/Payment"));
const Transactions = lazyWithRetry(() => import("./pages/Transactions"));
const Ledger = lazyWithRetry(() => import("./pages/Ledger"));
const Analytics = lazyWithRetry(() => import("./pages/Analytics"));
const More = lazyWithRetry(() => import("./pages/More"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Subscription = lazyWithRetry(() => import("./pages/Subscription"));
const Help = lazyWithRetry(() => import("./pages/Help"));
const HowTo = lazyWithRetry(() => import("./pages/HowTo"));
const CookiePolicy = lazyWithRetry(() => import("./pages/CookiePolicy"));
const TermsAndConditions = lazyWithRetry(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));

// Heavy components - lazy load with retry
const Users = lazyWithRetry(() => import('@/pages/Users'));
const ControlPanel = lazyWithRetry(() => import('@/pages/ControlPanel'));
const Accounts = lazyWithRetry(() => import('@/pages/control-panel/Accounts'));
const Onboarding = lazyWithRetry(() => import('@/pages/control-panel/Onboarding'));
const Support = lazyWithRetry(() => import('@/pages/control-panel/Support'));
const Communication = lazyWithRetry(() => import('@/pages/control-panel/Communication'));
const SystemSettings = lazyWithRetry(() => import('@/pages/control-panel/SystemSettings'));
const Government = lazyWithRetry(() => import('@/pages/control-panel/Government'));
const SubscriptionControl = lazyWithRetry(() => import('@/pages/control-panel/SubscriptionControl'));
const LandingPageBuilder = lazyWithRetry(() => import('@/pages/control-panel/LandingPageBuilder'));
const SuperAdminManagement = lazyWithRetry(() => import('@/pages/control-panel/SuperAdminManagement'));
const SubscriptionOutlets = lazyWithRetry(() => import('@/pages/subscription/Outlets'));
const SubscriptionStaff = lazyWithRetry(() => import('@/pages/subscription/Staff'));
const SubscriptionDepartments = lazyWithRetry(() => import('@/pages/subscription/Departments'));
const CashierDashboard = lazyWithRetry(() => import('@/pages/CashierDashboard'));
const GovLanding = lazyWithRetry(() => import('@/pages/government/GovLanding'));
const NationalDashboard = lazyWithRetry(() => import('@/pages/government/NationalDashboard'));
const CountyDashboard = lazyWithRetry(() => import('@/pages/government/CountyDashboard'));
const InterGovernmental = lazyWithRetry(() => import('@/pages/government/InterGovernmental'));
const MpesaDarajaSettings = lazyWithRetry(() => import('@/pages/MpesaDarajaSettings'));
const SubscriptionAnalytics = lazyWithRetry(() => import('@/pages/analytics/SubscriptionAnalytics'));
const SubscriptionCMS = lazyWithRetry(() => import('@/pages/cms/SubscriptionCMS'));
const ControlPanelCMS = lazyWithRetry(() => import('@/pages/control-panel/ControlPanelCMS'));
const TokenStore = lazyWithRetry(() => import('@/pages/TokenStore'));
const TokenManagement = lazyWithRetry(() => import('@/pages/control-panel/TokenManagement'));
const Receipts = lazyWithRetry(() => import('@/pages/Receipts'));
const ResetPassword = lazyWithRetry(() => import('@/pages/ResetPassword'));

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
              <LazyLoadErrorBoundary>
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
            <Route path="/control-panel/cms" element={<SuperAdminRoute><ControlPanelCMS /></SuperAdminRoute>} />
            <Route path="/control-panel/accounts" element={<SuperAdminRoute><Accounts /></SuperAdminRoute>} />
            <Route path="/control-panel/onboarding" element={<SuperAdminRoute><Onboarding /></SuperAdminRoute>} />
            <Route path="/control-panel/support" element={<SuperAdminRoute><Support /></SuperAdminRoute>} />
            <Route path="/control-panel/communication" element={<SuperAdminRoute><Communication /></SuperAdminRoute>} />
            <Route path="/control-panel/subscription-control" element={<SuperAdminRoute><SubscriptionControl /></SuperAdminRoute>} />
            <Route path="/control-panel/landing-page-builder" element={<SuperAdminRoute><LandingPageBuilder /></SuperAdminRoute>} />
            <Route path="/control-panel/system-settings" element={<SuperAdminRoute><SystemSettings /></SuperAdminRoute>} />
            <Route path="/control-panel/government" element={<SuperAdminRoute><Government /></SuperAdminRoute>} />
            <Route path="/control-panel/super-admin-management" element={<SuperAdminRoute><SuperAdminManagement /></SuperAdminRoute>} />
            <Route path="/control-panel/tokens" element={<SuperAdminRoute><TokenManagement /></SuperAdminRoute>} />
            <Route path="/tokens" element={<ProtectedRoute><TokenStore /></ProtectedRoute>} />
            <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
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
              </LazyLoadErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
