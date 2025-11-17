import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Wallet, Store, Building2, CheckCircle2, ArrowRight, PhoneCall, Mail, Key, CreditCard } from "lucide-react";

const HowTo = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">How to Use M-Leja</h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step procedural guides to help you get started with M-Leja payment management
          </p>
        </div>

        <Tabs defaultValue="registration" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            <TabsTrigger value="registration" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Registration
            </TabsTrigger>
            <TabsTrigger value="pochi" className="gap-2">
              <Wallet className="w-4 h-4" />
              Pochi
            </TabsTrigger>
            <TabsTrigger value="till" className="gap-2">
              <Store className="w-4 h-4" />
              Till
            </TabsTrigger>
            <TabsTrigger value="paybill" className="gap-2">
              <Building2 className="w-4 h-4" />
              Paybill
            </TabsTrigger>
          </TabsList>

          {/* Registration Guide */}
          <TabsContent value="registration">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <UserPlus className="w-6 h-6 text-primary" />
                  Account Registration Guide
                </CardTitle>
                <CardDescription>
                  Create your M-Leja account in 4 simple steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 1</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Enter Your Details</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Navigate to the <strong>Registration</strong> page from the landing screen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter your <strong>full name</strong> as it appears on official documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide your <strong>Kenyan phone number</strong> in format: +254XXXXXXXXX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Create a <strong>secure password</strong> (minimum 8 characters with uppercase, lowercase, and numbers)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide your <strong>email address</strong> for account recovery and notifications</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 2</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Verify Your Phone Number</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <PhoneCall className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You will receive an <strong>OTP (One-Time Password)</strong> via SMS to your registered phone number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Key className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter the <strong>6-digit verification code</strong> in the OTP input field</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click <strong>"Verify"</strong> to confirm your phone number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>If you don't receive the code, click <strong>"Resend OTP"</strong> after 60 seconds</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 3</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Link Your M-PESA Account</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Store className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select your <strong>M-PESA account type</strong>: Till Number, Paybill, or Pochi la Biashara</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CreditCard className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter your <strong>account number/shortcode</strong> (e.g., Till: 123456, Paybill: 400200)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide a <strong>friendly name</strong> for your account (e.g., "Main Store Till")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click <strong>"Add Account"</strong> to link your M-PESA account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Note:</strong> You can add multiple M-PESA accounts after registration</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 4 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 4</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Complete Registration & Start Using M-Leja</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6 space-y-3">
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Review and accept the <strong>Terms and Conditions</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click <strong>"Complete Registration"</strong> to finalize your account setup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You will receive a <strong>confirmation email</strong> with your account details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You'll be redirected to your <strong>Dashboard</strong> where you can start making payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Free Trial:</strong> New accounts receive 3 complimentary STK push requests to get started</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pochi la Biashara Integration */}
          <TabsContent value="pochi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Wallet className="w-6 h-6 text-primary" />
                  Pochi la Biashara Integration
                </CardTitle>
                <CardDescription>
                  How to integrate your Pochi la Biashara with M-Leja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Step-by-Step Integration Process</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium text-foreground">Navigate to Settings</p>
                        <p className="text-sm text-muted-foreground">Go to your M-Leja dashboard and click on "Settings" from the menu</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium text-foreground">Select "M-PESA Accounts"</p>
                        <p className="text-sm text-muted-foreground">Click on "M-PESA Accounts" tab to manage your linked accounts</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium text-foreground">Click "Add New Account"</p>
                        <p className="text-sm text-muted-foreground">Select the option to add a new M-PESA account</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium text-foreground">Choose "Pochi la Biashara"</p>
                        <p className="text-sm text-muted-foreground">Select Pochi la Biashara from the account type options</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">5</Badge>
                      <div>
                        <p className="font-medium text-foreground">Enter Your Pochi Phone Number</p>
                        <p className="text-sm text-muted-foreground">Input your registered Pochi la Biashara phone number (format: +254XXXXXXXXX)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">6</Badge>
                      <div>
                        <p className="font-medium text-foreground">Add Account Name</p>
                        <p className="text-sm text-muted-foreground">Provide a friendly name for easy identification (e.g., "Main Pochi Account")</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">7</Badge>
                      <div>
                        <p className="font-medium text-foreground">Verify & Save</p>
                        <p className="text-sm text-muted-foreground">Click "Save" to link your Pochi account. You can now trigger STK push payments to this account</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Important Notes
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Ensure your Pochi la Biashara is active and registered with Safaricom</li>
                    <li>• You must have STK Push enabled on your Pochi account</li>
                    <li>• Transaction fees apply as per Safaricom's Pochi la Biashara rates</li>
                    <li>• All transactions will be recorded in your M-Leja ledger automatically</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Till Number Integration */}
          <TabsContent value="till">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Store className="w-6 h-6 text-primary" />
                  Till Number Integration
                </CardTitle>
                <CardDescription>
                  How to integrate your M-PESA Till Number with M-Leja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Step-by-Step Integration Process</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium text-foreground">Access M-PESA Account Settings</p>
                        <p className="text-sm text-muted-foreground">Navigate to Settings → M-PESA Accounts in your M-Leja dashboard</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium text-foreground">Click "Add New Account"</p>
                        <p className="text-sm text-muted-foreground">Select the button to add a new M-PESA account to your profile</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium text-foreground">Select "Till Number"</p>
                        <p className="text-sm text-muted-foreground">Choose Till Number as your account type from the dropdown menu</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium text-foreground">Enter Your Till Number</p>
                        <p className="text-sm text-muted-foreground">Input your 5-7 digit Till Number (e.g., 123456)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">5</Badge>
                      <div>
                        <p className="font-medium text-foreground">Provide Business/Store Name</p>
                        <p className="text-sm text-muted-foreground">Enter your registered business name associated with the Till Number</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">6</Badge>
                      <div>
                        <p className="font-medium text-foreground">Add a Friendly Name</p>
                        <p className="text-sm text-muted-foreground">Create a descriptive name for easy identification (e.g., "Downtown Store Till")</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">7</Badge>
                      <div>
                        <p className="font-medium text-foreground">Verify Details & Save</p>
                        <p className="text-sm text-muted-foreground">Double-check all information and click "Save" to complete the integration</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">8</Badge>
                      <div>
                        <p className="font-medium text-foreground">Test the Integration</p>
                        <p className="text-sm text-muted-foreground">Make a test payment to ensure the Till is properly linked and receiving payments</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Till Number Requirements
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Your Till Number must be active and registered with Safaricom</li>
                    <li>• STK Push functionality must be enabled on your Till account</li>
                    <li>• You must have Daraja API credentials configured for your Till</li>
                    <li>• Standard M-PESA Till charges apply to all transactions</li>
                    <li>• Transactions are automatically recorded and reconciled in your ledger</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paybill Integration */}
          <TabsContent value="paybill">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="w-6 h-6 text-primary" />
                  Paybill Number Integration
                </CardTitle>
                <CardDescription>
                  How to integrate your M-PESA Paybill with M-Leja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Step-by-Step Integration Process</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium text-foreground">Navigate to Account Settings</p>
                        <p className="text-sm text-muted-foreground">Go to Settings → M-PESA Accounts from your dashboard menu</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium text-foreground">Initiate New Account Addition</p>
                        <p className="text-sm text-muted-foreground">Click "Add New Account" button to begin the integration process</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium text-foreground">Select "Paybill"</p>
                        <p className="text-sm text-muted-foreground">Choose Paybill as your account type from the available options</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium text-foreground">Enter Your Paybill Number</p>
                        <p className="text-sm text-muted-foreground">Input your 5-7 digit Paybill number (e.g., 400200, 522533)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">5</Badge>
                      <div>
                        <p className="font-medium text-foreground">Configure Daraja API Credentials</p>
                        <p className="text-sm text-muted-foreground">Enter your Consumer Key, Consumer Secret, and Passkey from Safaricom Daraja Portal</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">6</Badge>
                      <div>
                        <p className="font-medium text-foreground">Provide Organization Details</p>
                        <p className="text-sm text-muted-foreground">Enter your registered organization/business name associated with the Paybill</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">7</Badge>
                      <div>
                        <p className="font-medium text-foreground">Set Account Name</p>
                        <p className="text-sm text-muted-foreground">Create a descriptive identifier (e.g., "Head Office Paybill", "Regional Paybill")</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">8</Badge>
                      <div>
                        <p className="font-medium text-foreground">Test API Connection</p>
                        <p className="text-sm text-muted-foreground">Click "Test Connection" to verify your Daraja API credentials are correct</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-0.5">9</Badge>
                      <div>
                        <p className="font-medium text-foreground">Save & Activate</p>
                        <p className="text-sm text-muted-foreground">Review all details and click "Save" to complete the Paybill integration</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Paybill Integration Requirements
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Must have an active M-PESA Paybill account with Safaricom</li>
                    <li>• Daraja API access must be enabled for your Paybill</li>
                    <li>• You need valid Consumer Key, Consumer Secret, and Passkey credentials</li>
                    <li>• STK Push must be activated on your Paybill account</li>
                    <li>• Your Paybill must support programmatic payment requests</li>
                    <li>• Standard M-PESA Paybill transaction fees apply</li>
                    <li>• All payments are automatically tracked and reconciled in real-time</li>
                  </ul>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Need Help Getting Daraja Credentials?</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    To obtain your Daraja API credentials:
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>1. Visit the Safaricom Daraja Portal (developer.safaricom.co.ke)</li>
                    <li>2. Create an account or log in if you already have one</li>
                    <li>3. Navigate to "My Apps" and create a new application</li>
                    <li>4. Select "Lipa Na M-PESA Online" as your product</li>
                    <li>5. Your Consumer Key, Consumer Secret, and Passkey will be generated</li>
                    <li>6. Copy these credentials and paste them in M-Leja settings</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HowTo;
