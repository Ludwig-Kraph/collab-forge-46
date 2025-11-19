import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  Building2,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import logo from '@/assets/m-leja-logo.png';
import { getCopyrightText } from '@/utils/copyright';

const tiers = [
  {
    name: 'Free Trial',
    price: 'Free',
    description: '3 free STK pushes to get started',
    features: ['3 STK Pushes', '1 User', 'Basic Support'],
  },
  {
    name: 'Basic',
    price: 'KES 999',
    period: '/month',
    description: 'Perfect for small businesses',
    features: ['50 STK Pushes/month', '1 User', 'Email Support', 'Transaction History'],
  },
  {
    name: 'Professional',
    price: 'KES 2,999',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited STK Pushes', 'Up to 5 Users', 'Priority Support', 'Advanced Analytics'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited Everything', 'Unlimited Users', '24/7 Support', 'Custom Integrations', 'Dedicated Account Manager'],
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="M-Leja Logo" className="h-10 w-auto" />
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Streamline Your{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MPESA Payments
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trigger STK push payments, automatically capture transactions, and manage your digital ledger - all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="shadow-elegant">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            ✨ No credit card required • 3 free STK pushes included
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Manage MPESA Payments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            M-Leja provides all the tools you need to streamline your payment operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>STK Push Integration</CardTitle>
              <CardDescription>
                Trigger payment requests directly to your Till, Paybill, or Pochi numbers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure & Encrypted</CardTitle>
              <CardDescription>
                End-to-end encryption ensures your payment data is always protected
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Automatic Capture</CardTitle>
              <CardDescription>
                MPESA transaction messages are automatically parsed and recorded
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Digital Ledger</CardTitle>
              <CardDescription>
                Comprehensive transaction history with real-time balance tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Multi-User Access</CardTitle>
              <CardDescription>
                Role-based permissions for team collaboration and management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Enterprise Ready</CardTitle>
              <CardDescription>
                Analytics and reporting for corporate and government agencies
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with our free trial and upgrade as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className={cn(
              'relative',
              tier.popular && 'border-primary shadow-elegant scale-105'
            )}>
              <CardHeader>
                {tier.popular && (
                  <Badge className="w-fit mb-2 shadow-glow">⭐ Most Popular</Badge>
                )}
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
                </div>
                <CardDescription className="mt-2 h-12">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6" 
                  variant={tier.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 bg-muted/50">
        <Card className="border-0 shadow-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Streamline Your Payments?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join businesses and organizations using M-Leja to manage their MPESA operations
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {getCopyrightText()}
            </p>
            <div className="flex gap-4 justify-center text-sm">
              <Link to="/help" className="hover:underline text-muted-foreground">Help Center</Link>
              <Link to="/how-to" className="hover:underline text-muted-foreground">How To Guide</Link>
              <Link to="/cookie-policy" className="hover:underline text-muted-foreground">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
