import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Wallet, Store, Building2, CheckCircle2, ArrowRight } from "lucide-react";

import registrationStep1 from "@/assets/guide-registration-step1.png";
import registrationStep2 from "@/assets/guide-registration-step2.png";
import registrationStep3 from "@/assets/guide-registration-step3.png";
import pochiIntegration from "@/assets/guide-pochi-integration.png";
import tillIntegration from "@/assets/guide-till-integration.png";
import paybillIntegration from "@/assets/guide-paybill-integration.png";

const HowTo = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">How to Use M-Leja</h1>
          <p className="text-lg text-muted-foreground">
            Step-by-step guides to help you get started with M-Leja payment management
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
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={registrationStep1} 
                      alt="Registration Step 1 - Account Details" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Navigate to the registration page from the landing screen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter your full name as it appears on official documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide your Kenyan phone number in the format +254XXXXXXXXX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Create a strong password (minimum 8 characters with letters and numbers)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Continue" to proceed to verification</span>
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
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={registrationStep2} 
                      alt="Registration Step 2 - OTP Verification" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You will receive an OTP (One-Time Password) via SMS to your phone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter the 6-digit code in the verification boxes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>If you don't receive the code, click "Resend OTP" after 60 seconds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>The system will automatically verify and proceed to the next step</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 3</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Choose Your Plan</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={registrationStep3} 
                      alt="Registration Step 3 - Tier Selection" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Free Trial:</strong> Get 3 free STK pushes to test the platform (recommended for new users)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Professional:</strong> For small to medium businesses with unlimited transactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Business:</strong> For larger organizations with multi-user support and analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select the plan that best fits your needs and click "Continue"</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 4 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 4</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Complete Registration</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Review your registration details carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Read and accept the Terms of Service and Privacy Policy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Complete Registration" to create your account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You'll be automatically logged in and redirected to your dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="font-semibold">Next: Link your MPESA accounts to start accepting payments!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pochi Integration Guide */}
          <TabsContent value="pochi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Wallet className="w-6 h-6 text-primary" />
                  Pochi la Biashara Integration
                </CardTitle>
                <CardDescription>
                  Connect your MPESA Pochi account to receive payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>What is Pochi la Biashara?</strong> Pochi la Biashara is MPESA's merchant wallet service that allows you to receive payments directly to your phone number.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 1</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Navigate to Settings</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Log in to your M-Leja account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click on the "More" tab in the bottom navigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select "Settings" from the menu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Navigate to the "MPESA Accounts" section</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 2</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Add Your Pochi Account</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={pochiIntegration} 
                      alt="Pochi la Biashara Integration" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Add New Account" button</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select "Pochi la Biashara" as the account type</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter a friendly name for this account (e.g., "Main Business Pochi")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter your Pochi phone number in format +254XXXXXXXXX</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>This must be the same number registered with your Pochi la Biashara account</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 3</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Verify and Save</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Review all entered details for accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Save Account" to complete the integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Your Pochi account will appear in your linked accounts list</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You can now select this account when triggering STK push payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="font-semibold">You're ready to start receiving payments to your Pochi!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• You can link multiple Pochi accounts if you have more than one</li>
                    <li>• Set a descriptive name to easily identify each account</li>
                    <li>• Ensure your Pochi account is active and has sufficient limits</li>
                    <li>• Check with Safaricom if you need to increase your Pochi transaction limits</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Till Integration Guide */}
          <TabsContent value="till">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Store className="w-6 h-6 text-primary" />
                  Till Number Integration
                </CardTitle>
                <CardDescription>
                  Connect your MPESA Till number to accept business payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>What is a Till Number?</strong> An MPESA Till Number is a unique identifier for your business that allows customers to make payments directly to your merchant account.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 1</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Access MPESA Accounts</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>From your M-Leja dashboard, go to Settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click on "MPESA Accounts" section</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click the "Add New Account" button</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select "Till Number" from the account type dropdown</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 2</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Enter Till Details</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={tillIntegration} 
                      alt="Till Number Integration" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Provide a descriptive account name (e.g., "Shop Till - Main Branch")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter your 6 or 7-digit Till Number (e.g., 123456)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Find your Till Number in your MPESA merchant account or business portal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Double-check the number to avoid payment routing errors</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 3</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Complete Setup</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Verify that your Till Number is correct</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Save Account" to add the Till to your M-Leja account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>The Till will appear in your list of linked accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You can now use this Till when creating payment requests</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="font-semibold">Start accepting payments through your Till Number!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Keep your Till Number confidential to prevent unauthorized use</li>
                    <li>• Link multiple Tills if you have different business locations</li>
                    <li>• Regularly reconcile M-Leja records with your MPESA statement</li>
                    <li>• Set up notifications to get instant alerts for all Till transactions</li>
                    <li>• Contact Safaricom support if you need assistance with your Till account</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paybill Integration Guide */}
          <TabsContent value="paybill">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="w-6 h-6 text-primary" />
                  Paybill Number Integration
                </CardTitle>
                <CardDescription>
                  Connect your MPESA Paybill number for large-scale business operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>What is a Paybill Number?</strong> An MPESA Paybill is a merchant payment solution designed for established businesses and organizations to collect payments at scale.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 1</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Navigate to Account Setup</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Log into your M-Leja account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Navigate to More → Settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Open the "MPESA Accounts" section</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Add New Account"</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 2</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Configure Paybill Details</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <img 
                      src={paybillIntegration} 
                      alt="Paybill Number Integration" 
                      className="w-full rounded-md shadow-lg mb-4"
                    />
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Select "Paybill" as the account type from the dropdown</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Enter a recognizable name (e.g., "Corporate Paybill - Head Office")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Input your 5 to 7-digit Paybill Business Number (e.g., 12345)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Retrieve your Paybill number from Safaricom's MPESA Merchant Portal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Ensure you have the proper authorization to link this Paybill</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* Step 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-lg px-4 py-2">Step 3</Badge>
                    <h3 className="text-xl font-semibold text-foreground">Finalize Integration</h3>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Carefully review all entered information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Confirm that the Paybill number matches your official documentation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Click "Save Account" to complete the integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Your Paybill will be added to your linked accounts list</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>You can now process high-volume transactions through this Paybill</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="font-semibold">Your Paybill is ready for enterprise-level payments!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Paybills are ideal for organizations with high transaction volumes</li>
                    <li>• Configure account number validation for customer-specific transactions</li>
                    <li>• Set up automated reconciliation with your accounting system</li>
                    <li>• Use M-Leja's analytics to monitor Paybill performance and trends</li>
                    <li>• Maintain strict access control for Paybill integration settings</li>
                    <li>• Contact Safaricom for technical support with your Paybill account</li>
                  </ul>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">⚠️ Important Notes:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Paybill accounts require formal business registration</li>
                    <li>• Higher transaction limits compared to Till and Pochi</li>
                    <li>• May require additional verification from Safaricom</li>
                    <li>• Suitable for corporate and government institutions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* General Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you encounter any issues during registration or account integration, our support team is here to help:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">📧 Email Support</h4>
                <p className="text-sm text-muted-foreground">support@mleja.co.ke</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">📞 Phone</h4>
                <p className="text-sm text-muted-foreground">+254 700 123 456</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">💬 WhatsApp</h4>
                <p className="text-sm text-muted-foreground">+254 700 123 456</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HowTo;
