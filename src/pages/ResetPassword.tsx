import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, CheckCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/m-leja-logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let resolved = false;

    // Listen for PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event on reset page:', event);
      if (event === "PASSWORD_RECOVERY") {
        resolved = true;
        setIsRecovery(true);
        setChecking(false);
      } else if (event === "SIGNED_IN" && session) {
        // Check if we arrived here via a recovery link (hash contains type=recovery)
        const hash = window.location.hash;
        if (hash.includes("type=recovery") || hash.includes("type=signup")) {
          resolved = true;
          setIsRecovery(true);
          setChecking(false);
        }
      }
    });

    // Also check hash directly for recovery tokens
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      const accessToken = params.get("access_token");
      
      if (type === "recovery" && accessToken) {
        // Supabase will auto-set the session from the hash
        // Wait for the auth state change event
        console.log('Recovery token detected in hash');
      }
    }

    // Timeout - give enough time for Supabase to process the token
    const timeout = setTimeout(() => {
      if (!resolved) {
        // One last check - do we have an active session?
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && hash.includes("type=recovery")) {
            setIsRecovery(true);
          }
          setChecking(false);
        });
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    // Basic strength check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast({
        title: "Weak password",
        description: "Password must contain uppercase, lowercase, and a number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Redirecting to login...",
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth", { replace: true }), 3000);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. The link may have expired.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Verifying recovery link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been updated successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-4" />
            <CardTitle className="text-destructive">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/auth")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Reset links expire after 1 hour for security.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      <Card className="relative w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-1 text-center">
          <img src={logo} alt="M-Leja" className="h-10 w-auto mx-auto mb-2" />
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
          <CardDescription>
            Must be at least 8 characters with uppercase, lowercase, and a number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  <p className={`text-xs ${newPassword.length >= 8 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {newPassword.length >= 8 ? '✓' : '○'} 8+ characters
                  </p>
                  <p className={`text-xs ${/[A-Z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} Uppercase
                  </p>
                  <p className={`text-xs ${/[a-z]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {/[a-z]/.test(newPassword) ? '✓' : '○'} Lowercase
                  </p>
                  <p className={`text-xs ${/[0-9]/.test(newPassword) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {/[0-9]/.test(newPassword) ? '✓' : '○'} Number
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
