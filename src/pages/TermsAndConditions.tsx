import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Footer from "@/components/layout/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <Alert className="mb-6 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold">
            Use of M-Leja services for scams, fraud, or illegal practices constitutes a severe breach of trust and attracts a minimum fine of USD $300,000, with additional damages calculated based on the level of harm caused.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                By accessing and using M-Leja ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja is a Progressive Web Application designed to streamline MPESA payment operations for businesses and government agencies. The platform enables merchants to trigger STK push payments and automatically capture transaction records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Prohibited Activities and Legal Compliance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="font-semibold text-destructive">
                Users are strictly prohibited from using M-Leja for any illegal, fraudulent, or deceptive purposes, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Financial fraud, scams, or Ponzi schemes</li>
                <li>Money laundering or terrorist financing</li>
                <li>Unauthorized access to accounts or data</li>
                <li>Impersonation or identity theft</li>
                <li>Any activities violating local, national, or international laws</li>
              </ul>
              <p className="font-bold text-destructive mt-4">
                BREACH OF TRUST PENALTY: Any user found to be using M-Leja services for scams, fraud, or illegal practices will be subject to a minimum fine of USD $300,000 (Three Hundred Thousand US Dollars). Additional damages will be calculated based on the severity and extent of harm caused to victims, other users, or the platform's reputation. M-Leja reserves the right to pursue full legal action including criminal prosecution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. User Accounts and Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials. You agree to notify M-Leja immediately of any unauthorized use of your account. M-Leja implements industry-standard security measures but cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. MPESA Integration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Users must have valid MPESA accounts (Till, Paybill, or Pochi la Biashara) to use the Service. Users are responsible for compliance with MPESA terms and conditions. M-Leja acts as an intermediary and is not responsible for MPESA transaction failures or delays.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Subscription fees are based on the selected tier. Payments are non-refundable except as required by law. M-Leja reserves the right to modify pricing with 30 days' notice to existing subscribers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Data Protection and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja collects and processes personal data in accordance with our Privacy Policy and applicable data protection laws including the Kenya Data Protection Act. Transaction data is encrypted and stored securely.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the Service. Our total liability shall not exceed the amount paid by the user in the preceding 12 months.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja reserves the right to suspend or terminate accounts for violation of these terms, illegal activity, or fraudulent behavior. Users may terminate their accounts at any time through the account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                These Terms and Conditions are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Kenya.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja reserves the right to modify these terms at any time. Users will be notified of significant changes via email. Continued use of the Service after changes constitutes acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                For questions about these Terms and Conditions, please contact us at:<br />
                Email: legal@m-leja.com<br />
                Address: Nairobi, Kenya
              </p>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
