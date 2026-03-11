import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
  timestamp: string;
  version: string;
}

const CONSENT_VERSION = "1.0.0";
const CONSENT_KEY = "mleja_data_consent";

export const DataConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    thirdParty: false,
    timestamp: '',
    version: CONSENT_VERSION,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setShowBanner(true);
      return;
    }
    try {
      const parsed: ConsentPreferences = JSON.parse(stored);
      // Re-prompt if consent version changed
      if (parsed.version !== CONSENT_VERSION) {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    const finalPrefs = { ...prefs, timestamp: new Date().toISOString(), version: CONSENT_VERSION };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(finalPrefs));
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ ...preferences, essential: true, analytics: true, marketing: true, thirdParty: true });
  };

  const handleAcceptEssential = () => {
    saveConsent({ ...preferences, essential: true, analytics: false, marketing: false, thirdParty: false });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-border/60 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <CardTitle className="text-lg">Data Protection & Privacy Consent</CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed">
            M-Leja processes personal and financial data in compliance with the{' '}
            <strong>Kenya Data Protection Act, 2019</strong>, the{' '}
            <strong>EU General Data Protection Regulation (GDPR)</strong>, and{' '}
            <strong>international data protection standards</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Essential - always on */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
            <Checkbox checked disabled className="mt-0.5" />
            <div>
              <p className="text-sm font-medium">Essential Services</p>
              <p className="text-xs text-muted-foreground">
                Authentication, payment processing, session management, and security. Required for the service to function.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? 'Hide' : 'Show'} optional data preferences
          </button>

          {showDetails && (
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40">
                <Checkbox
                  checked={preferences.analytics}
                  onCheckedChange={(c) => setPreferences(p => ({ ...p, analytics: !!c }))}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Analytics & Improvement</p>
                  <p className="text-xs text-muted-foreground">
                    Usage analytics to improve service quality and user experience. Data is anonymized.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40">
                <Checkbox
                  checked={preferences.thirdParty}
                  onCheckedChange={(c) => setPreferences(p => ({ ...p, thirdParty: !!c }))}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Third-Party Services</p>
                  <p className="text-xs text-muted-foreground">
                    Data sharing with MPESA/Safaricom for payment processing and SMS verification providers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40">
                <Checkbox
                  checked={preferences.marketing}
                  onCheckedChange={(c) => setPreferences(p => ({ ...p, marketing: !!c }))}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Communications</p>
                  <p className="text-xs text-muted-foreground">
                    Product updates, feature announcements, and promotional communications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal references */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">
              <strong>Your rights under the Kenya Data Protection Act & GDPR:</strong> Access, rectification, 
              erasure, portability, objection, and withdrawal of consent. Contact our{' '}
              <span className="text-foreground">Data Protection Officer</span> or the{' '}
              <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Office of the Data Protection Commissioner
              </a>.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
          <Button onClick={handleAcceptAll} className="w-full sm:w-auto flex-1">
            Accept All
          </Button>
          {showDetails && (
            <Button onClick={handleSavePreferences} variant="secondary" className="w-full sm:w-auto flex-1">
              Save Preferences
            </Button>
          )}
          <Button onClick={handleAcceptEssential} variant="outline" className="w-full sm:w-auto flex-1">
            Essential Only
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
