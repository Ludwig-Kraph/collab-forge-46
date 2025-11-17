import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cookie className="h-5 w-5 text-primary" />
            Cookie Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <CardDescription className="text-sm">
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
            By continuing to use our site, you consent to our use of cookies in accordance with our{' '}
            <Link to="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            {' '}and Kenya's Data Protection Act, 2019.
          </CardDescription>
        </CardContent>
        <CardFooter className="flex gap-2 pt-0">
          <Button onClick={handleAccept} size="sm" className="flex-1">
            Accept
          </Button>
          <Button onClick={handleDecline} variant="outline" size="sm" className="flex-1">
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
