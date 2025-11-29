import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Progressive Web Application and services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4 className="font-semibold">Personal Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full name and business information</li>
                <li>Phone number and email address</li>
                <li>MPESA account details (Till, Paybill, Pochi numbers)</li>
                <li>Geographic location data for outlet management</li>
              </ul>
              <h4 className="font-semibold mt-4">Transaction Data:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment requests and transaction history</li>
                <li>MPESA receipt numbers and confirmation messages</li>
                <li>Transaction amounts, dates, and descriptions</li>
              </ul>
              <h4 className="font-semibold mt-4">Technical Information:</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and analytics data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide and maintain our payment processing services</li>
                <li>Process MPESA transactions and maintain digital ledgers</li>
                <li>Send transaction notifications and account updates</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Detect and prevent fraud, security threats, and illegal activities</li>
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Secure storage with encrypted databases</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and audit logging for all data access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>MPESA/Safaricom:</strong> To process payment transactions</li>
                <li><strong>Government Authorities:</strong> When required by law or for regulatory compliance</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services</li>
                <li><strong>Legal Requirements:</strong> To comply with legal processes or protect rights and safety</li>
              </ul>
              <p className="mt-4">
                We do NOT sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We retain your information for as long as necessary to provide services and comply with legal obligations. Transaction records are maintained for a minimum of 7 years as required by financial regulations. You may request deletion of your account, though certain information may be retained for legal compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Under the Kenya Data Protection Act and applicable laws, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent for data processing</li>
                <li>Lodge a complaint with the Office of the Data Protection Commissioner</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We use cookies and similar tracking technologies to enhance user experience, analyze usage patterns, and maintain session security. You can control cookie preferences through your browser settings, though some functionality may be limited if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Our service integrates with MPESA Daraja API and other third-party services. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Government Portal Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                For government users, additional security measures and data protection protocols apply. Government transaction data is segregated and subject to enhanced encryption and access controls in compliance with government security standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                M-Leja is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                We may update this Privacy Policy from time to time. We will notify users of significant changes via email or in-app notification. The "Last Updated" date at the bottom indicates when the policy was last revised.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                For questions or concerns about this Privacy Policy or our data practices, please contact:<br />
                <strong>Data Protection Officer</strong><br />
                Email: privacy@m-leja.com<br />
                Address: Nairobi, Kenya<br />
                <br />
                To exercise your data rights or file a complaint, contact the Office of the Data Protection Commissioner of Kenya at: <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.odpc.go.ke</a>
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

export default PrivacyPolicy;
