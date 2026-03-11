import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { OTPInput } from "@/components/forms/OTPInput";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, CheckCircle, Shield, KeyRound } from "lucide-react";
import logo from "@/assets/m-leja-logo.png";

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = "phone" | "otp" | "newPassword" | "success";

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizePhone = (raw: string) => {
    let p = raw.trim().replace(/[\s\-()]/g, "");
    if (p.startsWith("+254")) p = p.slice(1);
    else if (p.startsWith("0")) p = "254" + p.slice(1);
    else if (!p.startsWith("254")) p = "254" + p;
    return p;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: "Phone required", description: "Please enter your phone number.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      // Send OTP to the phone number for verification
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (error) throw error;

      setPhone(normalized); // store normalized
      setStep("otp");
      toast({ title: "OTP Sent", description: "A verification code has been sent to your phone via SMS." });
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Could not send verification code. Please check your phone number.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otpCode,
        type: "sms",
      });
      if (error) throw error;

      setStep("newPassword");
      toast({ title: "Phone Verified", description: "Now set your new password." });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please ensure both passwords are identical.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setStep("success");
      toast({ title: "Password Reset!", description: "Your password has been updated successfully." });

      // Sign out so they can log in fresh
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast({ title: "Code Resent", description: "A new verification code has been sent." });
    } catch (error: any) {
      toast({ title: "Resend Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (step === "success") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been updated. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // OTP verification step
  if (step === "otp") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Verify Your Phone</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <span className="font-medium text-foreground">+{phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OTPInput value={otpCode} onChange={setOtpCode} length={6} />

          <Button
            className="w-full h-10"
            onClick={handleVerifyOTP}
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          <Button variant="ghost" className="w-full" onClick={handleResendOTP} disabled={loading}>
            Didn't receive code? Resend
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => { setStep("phone"); setOtpCode(""); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Phone Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  // New password step
  if (step === "newPassword") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password. Must be at least 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Phone input step (default)
  return (
    <Card className="w-full max-w-md shadow-lg border-border/60">
      <CardHeader className="space-y-1">
        <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Phone className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl text-center">Forgot Password?</CardTitle>
        <CardDescription className="text-center">
          Enter the phone number linked to your M-Leja account.
          We'll send you an SMS verification code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOTP} className="space-y-4">
          <PhoneInput
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254712345678"
            required
          />

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>

          <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
