import { useState } from "react";
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
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
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

  // Mock MPESA accounts
  const mpesaAccounts = [
    { id: "1", name: "Till Number - 5847362", type: "till" },
    { id: "2", name: "Paybill - 400200 (Acc: 12345)", type: "paybill" },
    { id: "3", name: "Pochi la Biashara - 0712345678", type: "pochi" },
  ];

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
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    // Simulate STK push
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Payment Request Sent",
        description: "STK push sent successfully. Waiting for customer confirmation...",
      });
      
      // Reset form
      setFormData({
        phoneNumber: "",
        amount: 0,
        description: "",
        mpesaAccount: "",
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="container max-w-2xl px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Payment</CardTitle>
            <CardDescription>
              Send an STK push request to your customer's phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MPESA Account Selection */}
              <div className="space-y-2">
                <Label htmlFor="mpesa-account">
                  Select MPESA Account <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.mpesaAccount}
                  onValueChange={(value) => setFormData({ ...formData, mpesaAccount: value })}
                >
                  <SelectTrigger id="mpesa-account" className={errors.mpesaAccount ? "border-destructive" : ""}>
                    <SelectValue placeholder="Choose your MPESA account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mpesaAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mpesaAccount && (
                  <p className="text-sm text-destructive">{errors.mpesaAccount}</p>
                )}
              </div>

              {/* Customer Phone Number */}
              <PhoneInput
                label="Customer Phone Number"
                placeholder="+254712345678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                error={errors.phoneNumber}
                required
              />

              {/* Amount */}
              <AmountInput
                label="Amount"
                value={formData.amount}
                onValueChange={(value) => setFormData({ ...formData, amount: value })}
                error={errors.amount}
                required
              />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Payment Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="E.g., Invoice #1234, Product purchase..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Summary */}
              {formData.amount > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount to collect:</span>
                        <span className="font-mono-numbers font-semibold">
                          KES {formData.amount.toLocaleString()}
                        </span>
                      </div>
                      {formData.phoneNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer:</span>
                          <span className="font-medium">{formData.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send STK Push
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment Request</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>You are about to send an STK push for:</p>
              <div className="rounded-lg border bg-muted p-4 font-mono-numbers">
                <div className="mb-2 flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">KES {formData.amount.toLocaleString()}</span>
                </div>
                <div className="mb-2 flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{formData.phoneNumber}</span>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note:</span>
                    <span className="font-medium">{formData.description}</span>
                  </div>
                )}
              </div>
              <p className="text-sm">The customer will receive a payment prompt on their phone.</p>
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
    </Layout>
  );
};

export default Payment;