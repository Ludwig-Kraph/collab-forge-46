import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cookie, Shield, Settings, FileText } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Cookie className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Cookie Policy explains how M-Leja ("we", "us", or "our") uses cookies and similar technologies 
              when you visit our Progressive Web Application (PWA). This policy complies with Kenya's Data Protection 
              Act, 2019, and the General Data Protection Regulation (GDPR) where applicable.
            </p>
            <p>
              By using M-Leja, you consent to the use of cookies in accordance with this policy. If you do not 
              agree to our use of cookies, you should adjust your browser settings accordingly or refrain from 
              using our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>What Are Cookies?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when 
              you visit a website or use an application. They help the application recognize your device and store 
              information about your preferences or past actions.
            </p>
            <p>
              M-Leja uses cookies to provide secure authentication, remember your preferences, and improve your 
              overall experience with our payment management platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Types of Cookies We Use</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Essential Cookies (Strictly Necessary)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are required for the basic functionality of M-Leja and cannot be disabled.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Authentication cookies:</strong> Keep you logged in securely during your session</li>
                <li><strong>Session management:</strong> Maintain your session state across different pages</li>
                <li><strong>Security cookies:</strong> Protect against fraudulent activities and ensure secure connections</li>
                <li><strong>Load balancing:</strong> Distribute service load for optimal performance</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">2. Functional Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies enhance functionality and personalization but are not essential for basic operation.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Language preferences:</strong> Remember your preferred language settings</li>
                <li><strong>Theme preferences:</strong> Store your dark/light mode preference</li>
                <li><strong>Dashboard layout:</strong> Remember your customized dashboard configuration</li>
                <li><strong>Notification settings:</strong> Store your notification preferences</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">3. Analytics Cookies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us understand how you use M-Leja so we can improve our service.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Usage statistics:</strong> Track which features are most used</li>
                <li><strong>Performance monitoring:</strong> Identify and fix technical issues</li>
                <li><strong>Error tracking:</strong> Help us identify and resolve bugs</li>
                <li>Note: All analytics data is anonymized and aggregated</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">4. Local Storage</h3>
              <p className="text-sm text-muted-foreground mb-2">
                As a PWA, M-Leja also uses browser local storage for offline functionality:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Offline data:</strong> Cache transaction data for offline viewing</li>
                <li><strong>Pending actions:</strong> Queue payment requests when offline</li>
                <li><strong>Application state:</strong> Maintain app state for better performance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Data Protection & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Kenya Data Protection Act, 2019 Compliance</h3>
              <p className="text-sm text-muted-foreground">
                M-Leja is committed to complying with the Kenya Data Protection Act, 2019. We process personal 
                data lawfully, fairly, and in a transparent manner. Your consent to cookies is explicitly obtained, 
                and you have the right to withdraw consent at any time.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">GDPR Compliance</h3>
              <p className="text-sm text-muted-foreground">
                For users in the European Union, we comply with GDPR requirements. You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>Access your personal data stored in cookies</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Third-Party Cookies</h3>
              <p className="text-sm text-muted-foreground">
                M-Leja integrates with M-Pesa Daraja API for payment processing. While we do not set third-party 
                cookies ourselves, the M-Pesa service may use its own cookies during payment transactions. Please 
                refer to Safaricom's privacy policy for information about their cookie usage.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Browser Settings</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You can control and manage cookies through your browser settings:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">M-Leja Settings</h3>
              <p className="text-sm text-muted-foreground">
                You can manage some cookie preferences directly within M-Leja through Settings → Privacy Settings. 
                Note that disabling essential cookies may affect the functionality of the application.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                If you disable cookies, you may not be able to use all features of M-Leja. Essential cookies 
                required for authentication and security cannot be disabled without affecting your ability to 
                use the service.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cookie data is retained as follows:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Stored for up to 90 days</li>
              <li><strong>Authentication tokens:</strong> Valid for 24 hours or until logout</li>
              <li><strong>Local storage:</strong> Retained until manually cleared or app uninstalled</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal 
              requirements. We will notify you of any material changes by posting the new policy on this page 
              and updating the "Last updated" date.
            </p>
            <p className="text-sm text-muted-foreground">
              Continued use of M-Leja after changes to this policy constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Data Protection Officer</strong></p>
              <p>Email: privacy@m-leja.co.ke</p>
              <p>Phone: +254 700 000 000</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              For complaints regarding data protection, you may also contact the Office of the Data Protection 
              Commissioner of Kenya:
            </p>
            <div className="space-y-2 text-sm">
              <p>Email: complaints@odpc.go.ke</p>
              <p>Website: www.odpc.go.ke</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
