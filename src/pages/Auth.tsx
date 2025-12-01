import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Shield, Zap, ArrowLeft, Home } from 'lucide-react';
import { RegistrationWizard } from '@/components/auth/RegistrationWizard';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import logo from '@/assets/m-leja-logo.png';

export default function Auth() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Redirect if already authenticated on page load (not after login)
  useEffect(() => {
    let mounted = true;
    
    if (user && mounted) {
      navigate('/dashboard', { replace: true });
    }
    
    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Normalize phone number for Supabase auth
    // Supabase stores phone numbers in international format without +
    let normalizedPhone = loginPhone.trim();
    
    // Remove any spaces, dashes, or parentheses
    normalizedPhone = normalizedPhone.replace(/[\s\-()]/g, '');
    
    // Normalize to format Supabase expects: 254XXXXXXXXX (no + prefix)
    if (normalizedPhone.startsWith('+254')) {
      normalizedPhone = normalizedPhone.slice(1); // Remove +
    } else if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '254' + normalizedPhone.slice(1); // Convert 07... to 2547...
    } else if (!normalizedPhone.startsWith('254')) {
      normalizedPhone = '254' + normalizedPhone; // Add 254 prefix if missing
    }
    
    const { error } = await signIn(normalizedPhone, loginPassword);
    
    // Don't manually navigate - let useEffect handle it after user state updates
    
    setLoading(false);
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    setShowWelcome(true);
  };

  if (showRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="w-full max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => setShowRegistration(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          <RegistrationWizard
            onComplete={handleRegistrationComplete}
            onCancel={() => setShowRegistration(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="absolute top-4 left-4"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-6">
            <div className="space-y-4">
              <img src={logo} alt="M-Leja" className="h-16 w-auto" />
              <p className="text-xl text-muted-foreground">
                Streamline your MPESA payment operations
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy STK Push</h3>
                  <p className="text-sm text-muted-foreground">
                    Trigger payments directly to your Till, Paybill, or Pochi numbers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Encrypted</h3>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encryption for all your payment data
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic transaction capture and digital ledger updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome to M-Leja</CardTitle>
              <CardDescription>
                Sign in to your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <PhoneInput
                  label="Phone Number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRegistration(true)}
                >
                  Create New Account
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  New users get 3 free STK pushes to try M-Leja 🎉
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={userName}
      />
    </>
  );
}
