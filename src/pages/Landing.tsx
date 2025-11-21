import { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  // Fetch subscription tiers from database
  useEffect(() => {
    let mounted = true;

    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('show_on_landing', true)
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (mounted && data && !error) {
          const formattedTiers: Tier[] = data.map(tier => ({
            name: tier.name,
            price: tier.price === 0 ? 'Free' : `${tier.currency} ${tier.price.toLocaleString()}`,
            period: tier.is_period_enabled ? `/${tier.period}` : undefined,
            description: tier.description || '',
            features: (Array.isArray(tier.features) ? tier.features : []).filter((f): f is string => typeof f === 'string'),
            popular: false,
          }));
          setTiers(formattedTiers);
        }
      } catch (error) {
        console.error('Error fetching tiers:', error);
      } finally {
        if (mounted) {
          setLoadingTiers(false);
        }
      }
    };

    fetchTiers();

    return () => {
      mounted = false;
    };
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
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

        {loadingTiers ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pricing plans...</p>
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pricing plans available at the moment.</p>
          </div>
        ) : (
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
                    {tier.features.map((feature, index) => (
                      <li key={`${tier.name}-${index}`} className="flex items-center gap-2">
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
        )}
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
