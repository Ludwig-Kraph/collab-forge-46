import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Shield, Zap, Gift, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
}

const features = [
  {
    icon: Smartphone,
    title: 'Trigger STK Pushes',
    description: 'Send payment requests instantly to your customers',
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Bank-level encryption for all your payments',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Track transactions as they happen',
  },
  {
    icon: Gift,
    title: '3 Free Pushes',
    description: 'Try M-Leja with 3 complimentary STK pushes',
  },
];

export function WelcomeModal({ open, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 0 && (
          <div className="space-y-6 py-4">
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl text-center">
                Welcome to M-Leja, {userName}!
              </DialogTitle>
              <DialogDescription className="text-center">
                You're all set to start managing your MPESA payments
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-4 rounded-lg border bg-card text-center"
                  >
                    <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button onClick={handleNext} className="w-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Quick Start Guide</DialogTitle>
              <DialogDescription className="text-center">
                Here's how to make your first payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Link Your MPESA Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Add your Till, Paybill, or Pochi number in Settings
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Trigger a Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the + button to send an STK push to customers
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Track Transactions</h4>
                  <p className="text-sm text-muted-foreground">
                    View real-time updates in your transaction history
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              Start Using M-Leja
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
