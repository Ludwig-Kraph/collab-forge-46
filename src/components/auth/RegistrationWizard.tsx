import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { OTPInput } from '@/components/forms/OTPInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, ArrowRight, ArrowLeft, Smartphone, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tiers = [
  { value: 'free_trial', label: 'Free Trial', description: '3 free STK pushes', icon: Smartphone },
  { value: 'basic', label: 'Basic', description: 'KES 999/month', icon: CreditCard },
  { value: 'professional', label: 'Professional', description: 'KES 2,999/month', icon: Crown, popular: true },
];

const steps = [
  { id: 1, name: 'Account Details' },
  { id: 2, name: 'Verify Phone' },
  { id: 3, name: 'Choose Tier' },
  { id: 4, name: 'Terms' },
];

interface RegistrationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function RegistrationWizard({ onComplete, onCancel }: RegistrationWizardProps) {
  const { signUp, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedTier, setSelectedTier] = useState('free_trial');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const handleStep1Next = async () => {
    if (!fullName || !phone || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await signUp(phone, password, fullName);
    setLoading(false);

    if (!error) {
      setCurrentStep(2);
    }
  };

  const handleStep2Next = async () => {
    if (otpCode.length !== 6) return;

    setLoading(true);
    const { error } = await verifyOTP(phone, otpCode);
    setLoading(false);

    if (!error) {
      setCurrentStep(3);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    await resendOTP(phone);
    setLoading(false);
  };

  const handleComplete = () => {
    if (!termsAccepted) return;
    onComplete();
    navigate('/dashboard');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Create Your Account</CardTitle>
          <Badge variant="secondary">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-2 mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 text-center text-xs py-2 rounded transition-colors',
                currentStep === step.id
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step.name}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Account Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <PhoneInput
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              required
            />

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleStep1Next}
                disabled={loading || !fullName || !phone || !password || !confirmPassword}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Verify Your Phone</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {phone}
              </CardDescription>
            </div>

            <OTPInput value={otpCode} onChange={setOtpCode} length={6} />

            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full"
            >
              Didn't receive code? Resend
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleStep2Next}
                disabled={loading || otpCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Tier */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <CardTitle className="text-xl">Choose Your Plan</CardTitle>
              <CardDescription>
                You can upgrade or downgrade anytime
              </CardDescription>
            </div>

            <div className="grid gap-4">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div
                    key={tier.value}
                    onClick={() => setSelectedTier(tier.value)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
                      selectedTier === tier.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-2 right-4">Most Popular</Badge>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{tier.label}</h3>
                        <p className="text-sm text-muted-foreground">{tier.description}</p>
                      </div>
                      {selectedTier === tier.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep(4)} className="flex-1">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Terms & Conditions */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <CardTitle className="text-xl">Almost Done!</CardTitle>
              <CardDescription>
                Please review and accept our terms
              </CardDescription>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Your Account Summary</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Name:</span> {fullName}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {phone}</p>
                  <p><span className="text-muted-foreground">Plan:</span> {tiers.find(t => t.value === selectedTier)?.label}</p>
                </div>
              </div>

              {selectedTier === 'free_trial' && (
                <div className="bg-primary/10 border border-primary/20 rounded p-3">
                  <p className="text-sm font-medium text-primary">
                    🎉 You'll get 3 free STK pushes to try M-Leja!
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!termsAccepted}
                className="flex-1"
              >
                Complete Registration
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
