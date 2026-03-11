import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { OTPInput } from "@/components/forms/OTPInput";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Mail, CheckCircle, Shield, KeyRound, Loader2 } from "lucide-react";
import logo from "@/assets/m-leja-logo.png";

interface ForgotPasswordProps {
  onBack: () => void;
}

type Step = "method" | "input" | "otp" | "newPassword" | "success";
type Method = "phone" | "email";

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<Method>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const normalizePhone = (raw: string) => {
    let p = raw.trim().replace(/[\s\-()]/g, "");
    if (p.startsWith("+254")) p = p.slice(1);
    else if (p.startsWith("0")) p = "254" + p.slice(1);
    else if (!p.startsWith("254")) p = "254" + p;
    return p;
  };

  const handleSelectMethod = (m: Method) => {
    setMethod(m);
    setStep("input");
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (method === "phone") {
        const normalized = normalizePhone(phone);
        const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
        if (error) throw error;
        setPhone(normalized);
        setStep("otp");
        toast({ title: "OTP Sent", description: "A verification code has been sent to your phone via SMS." });
      } else {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
          setLoading(false);
          return;
        }

        // Use the edge function for reliable email delivery
        const { data, error } = await supabase.functions.invoke('send-recovery-email', {
          body: { 
            email: trimmedEmail,
            redirectUrl: `${window.location.origin}/reset-password`
          }
        });

        if (error) {
          // Fallback to standard Supabase method
          console.warn('Edge function failed, falling back to standard method:', error);
          const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (fallbackError) throw fallbackError;
        }

        setEmailSent(true);
        toast({ title: "Reset email sent", description: "Check your email for the password reset link." });
      }
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message || "Please check your details and try again.",
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
      const { error } = await supabase.auth.verifyOtp({ phone, token: otpCode, type: "sms" });
      if (error) throw error;
      setStep("newPassword");
      toast({ title: "Phone Verified", description: "Now set your new password." });
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message || "Invalid or expired code.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
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
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({ title: "Reset Failed", description: error.message || "Failed to reset password.", variant: "destructive" });
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

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-recovery-email', {
        body: { 
          email: email.trim(),
          redirectUrl: `${window.location.origin}/reset-password`
        }
      });
      if (error) {
        const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (fallbackError) throw fallbackError;
      }
      toast({ title: "Email Resent", description: "A new reset link has been sent to your email." });
    } catch (error: any) {
      toast({ title: "Resend Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Success
  if (step === "success") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Password Reset Complete</CardTitle>
          <CardDescription>Your password has been updated. You can now sign in with your new password.</CardDescription>
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

  // Email sent confirmation
  if (method === "email" && emailSent) {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            Click the link in the email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam/junk folder or try resending.
          </p>
          <Button variant="outline" className="w-full" onClick={handleResendEmail} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Resend Reset Email
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => { setEmailSent(false); setEmail(""); }}>
            Try another email
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => { setStep("method"); setEmailSent(false); setEmail(""); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Use different method
          </Button>
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // OTP verification (phone only)
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
          <Button className="w-full h-10" onClick={handleVerifyOTP} disabled={loading || otpCode.length !== 6}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify & Continue"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleResendOTP} disabled={loading}>
            Didn't receive code? Resend
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => { setStep("input"); setOtpCode(""); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Phone Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  // New password (phone flow)
  if (step === "newPassword") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password. Must be at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="Enter new password" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} placeholder="Confirm new password" className="h-10" />
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Input step (phone or email)
  if (step === "input") {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-1">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {method === "phone" ? <Phone className="h-6 w-6 text-primary" /> : <Mail className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-xl text-center">
            {method === "phone" ? "Reset via Phone" : "Reset via Email"}
          </CardTitle>
          <CardDescription className="text-center">
            {method === "phone"
              ? "Enter your registered phone number. We'll send a verification code via SMS."
              : "Enter your registered email address. We'll send a password reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            {method === "phone" ? (
              <PhoneInput
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                required
              />
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-sm">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-10"
                />
              </div>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : method === "phone" ? "Send Verification Code" : "Send Reset Link"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => setStep("method")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose different method
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Method selection (default)
  return (
    <Card className="w-full max-w-md shadow-lg border-border/60">
      <CardHeader className="space-y-1">
        <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl text-center">Forgot Password?</CardTitle>
        <CardDescription className="text-center">
          Choose how you'd like to recover your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 px-4"
          onClick={() => handleSelectMethod("phone")}
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Via Phone (SMS)</p>
            <p className="text-xs text-muted-foreground">Receive a verification code via SMS</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-14 justify-start gap-4 px-4"
          onClick={() => handleSelectMethod("email")}
        >
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Via Email</p>
            <p className="text-xs text-muted-foreground">Receive a reset link to your email</p>
          </div>
        </Button>

        <div className="pt-2">
          <Button variant="ghost" className="w-full" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
