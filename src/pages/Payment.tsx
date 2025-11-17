import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { AmountInput } from "@/components/forms/AmountInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMpesaPayment } from "@/hooks/useMpesaPayment";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Send, CheckCircle, XCircle, Clock, Shield, Infinity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const { initiatePayment, loading: paymentLoading } = useMpesaPayment();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const { paymentStatus, loading: statusLoading } = usePaymentStatus(paymentRequestId || undefined);
  const [mpesaAccounts, setMpesaAccounts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: 0,
    description: "",
    mpesaAccount: "",
  });

  const [errors, setErrors] = useState({
    phoneNumber: "",
    amount: "",
    mpesaAccount: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Fetch user's MPESA accounts
  useEffect(() => {
    const fetchMpesaAccounts = async () => {
      const { data, error } = await supabase
        .from('mpesa_accounts')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setMpesaAccounts(data);
        
        // Show warning if no accounts found
        if (data.length === 0) {
          toast({
            title: "No MPESA Accounts",
            description: "Please add an MPESA account in Settings before making payments.",
            variant: "destructive",
          });
        }
      } else if (error) {
        console.error('Error fetching MPESA accounts:', error);
        toast({
          title: "Error",
          description: "Failed to load MPESA accounts. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchMpesaAccounts();
  }, [toast]);

  const validateForm = () => {
    const newErrors = {
      phoneNumber: "",
      amount: "",
      mpesaAccount: "",
    };

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^(?:\+254|254|0)?[17]\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid Kenyan phone number";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (formData.amount < 10) {
      newErrors.amount = "Minimum amount is KES 10";
    }

    if (!formData.mpesaAccount) {
      newErrors.mpesaAccount = "Please select an MPESA account";
    }

    setErrors(newErrors);
    const isValid = !Object.values(newErrors).some(error => error);
    setIsFormValid(isValid);
    return isValid;
  };

  // Validate form whenever formData changes
  useEffect(() => {
    const newErrors = {
      phoneNumber: "",
      amount: "",
      mpesaAccount: "",
    };

    if (formData.phoneNumber && !/^(?:\+254|254|0)?[17]\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid Kenyan phone number";
    }

    if (formData.amount > 0 && formData.amount < 10) {
      newErrors.amount = "Minimum amount is KES 10";
    }

    setErrors(newErrors);
    
    const isValid = formData.phoneNumber !== "" && 
                    formData.amount >= 10 && 
                    formData.mpesaAccount !== "" &&
                    !Object.values(newErrors).some(error => error);
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);

    // Clear previous payment status before initiating new payment
    setPaymentRequestId(null);

    const result = await initiatePayment({
      mpesaAccountId: formData.mpesaAccount,
      customerPhone: formData.phoneNumber,
      amount: formData.amount,
      description: formData.description || undefined,
    });

    if (result) {
      setPaymentRequestId(result.paymentRequestId);
      
      toast({
        title: "Payment Request Sent",
        description: "Waiting for customer to complete payment on their phone...",
      });
      
      // Reset form
      setFormData({
        phoneNumber: "",
        amount: 0,
        description: "",
        mpesaAccount: "",
      });
      setErrors({
        phoneNumber: "",
        amount: "",
        mpesaAccount: "",
      });
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          {isSuperAdmin && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
              <Infinity className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Payment</CardTitle>
            <CardDescription>
              Send an STK push request to your customer's phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentStatus && (
              <Card className="mb-6 border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {paymentStatus.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : paymentStatus.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
                      )}
                      <span className="font-medium">Payment Status</span>
                    </div>
                    <Badge variant={
                      paymentStatus.status === 'completed' ? 'default' :
                      paymentStatus.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {paymentStatus.status.toUpperCase()}
                    </Badge>
                  </div>
                  {paymentStatus.result_desc && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {paymentStatus.result_desc}
                    </p>
                  )}
                  <div className="mt-2 text-sm">
                    <p className="text-muted-foreground">Amount: KES {paymentStatus.amount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Phone: {paymentStatus.customer_phone}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MPESA Account Selection */}
              <div className="space-y-2">
                <Label htmlFor="mpesa-account">
                  MPESA Account <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.mpesaAccount}
                  onValueChange={(value) => setFormData({ ...formData, mpesaAccount: value })}
                >
                  <SelectTrigger id="mpesa-account" className={errors.mpesaAccount ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select MPESA account" />
                  </SelectTrigger>
                  <SelectContent>
              {mpesaAccounts.length === 0 ? (
                      <div className="p-2 text-sm text-destructive">
                        No MPESA accounts found. Please add one in Settings.
                      </div>
                    ) : (
                      mpesaAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} - {account.account_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.mpesaAccount && (
                  <p className="text-sm text-red-500">{errors.mpesaAccount}</p>
                )}
              </div>

              {/* Customer Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Customer Phone Number <span className="text-red-500">*</span>
                </Label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  error={errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (KES) <span className="text-red-500">*</span>
                </Label>
                <AmountInput
                  value={formData.amount}
                  onValueChange={(value) => setFormData({ ...formData, amount: value })}
                  error={errors.amount}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payment for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Payment Summary */}
              {formData.amount > 0 && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Payment Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">KES {formData.amount.toLocaleString()}</span>
                    </div>
                    {formData.phoneNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{formData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full" 
                size="lg" 
                disabled={!isFormValid || paymentLoading || mpesaAccounts.length === 0}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Payment Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Real-time Payment Status Display */}
        {paymentStatus && (
          <Card className={`border-2 transition-all duration-300 ${
            paymentStatus.status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
            paymentStatus.status === 'failed' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
            'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 animate-pulse'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {paymentStatus.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                {paymentStatus.status === 'failed' && (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                {paymentStatus.status === 'pending' && (
                  <div className="relative">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    {statusLoading && (
                      <Loader2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-spin absolute -right-1 -top-1" />
                    )}
                  </div>
                )}
                {paymentStatus.status === 'pending' ? 'Waiting for Payment...' : 
                 paymentStatus.status === 'completed' ? 'Payment Successful!' :
                 'Payment Failed'}
              </CardTitle>
              <CardDescription>
                {paymentStatus.status === 'pending' && 'Customer will receive STK push on their phone'}
                {paymentStatus.status === 'completed' && 'Payment completed successfully'}
                {paymentStatus.status === 'failed' && 'Payment was not completed'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge 
                  variant={
                    paymentStatus.status === 'completed' ? 'default' : 
                    paymentStatus.status === 'failed' ? 'destructive' : 
                    'secondary'
                  }
                  className="animate-in fade-in"
                >
                  {paymentStatus.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">KES {paymentStatus.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-sm">{paymentStatus.customer_phone}</span>
              </div>
              {paymentStatus.description && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-sm">{paymentStatus.description}</span>
                </div>
              )}
              {paymentStatus.result_desc && (
                <div className="flex flex-col gap-1 p-3 bg-background/50 rounded-md">
                  <span className="text-muted-foreground font-medium">Result:</span>
                  <span className="text-sm">{paymentStatus.result_desc}</span>
                </div>
              )}
              {paymentStatus.completed_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="text-sm">
                    {new Date(paymentStatus.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
              
              {paymentStatus.status === 'pending' && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Monitoring payment status in real-time...</span>
                  </div>
                </div>
              )}

              {paymentStatus.status === 'completed' && (
                <Button 
                  onClick={() => setPaymentRequestId(null)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Start New Payment
                </Button>
              )}

              {paymentStatus.status === 'failed' && (
                <Button 
                  onClick={() => setPaymentRequestId(null)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Payment Request</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to send a payment request for <strong>KES {formData.amount.toLocaleString()}</strong> to{" "}
                <strong>{formData.phoneNumber}</strong>.
                <br /><br />
                The customer will receive an STK push on their phone to authorize this payment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPayment}>
                Confirm & Send
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Payment;
