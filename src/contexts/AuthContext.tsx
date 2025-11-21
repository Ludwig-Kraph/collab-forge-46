import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: string | null;
  isBlocked: boolean;
  isExpired: boolean;
  signUp: (phone: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  resendOTP: (phone: string) => Promise<{ error: any }>;
  createRBACUser: (
    email: string, 
    password: string, 
    fullName: string, 
    role: string,
    accountType?: string,
    accountId?: string,
    roleLevel?: string
  ) => Promise<{ error: any, user: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (fullName: string, phoneNumber?: string) => Promise<{ error: any }>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<{ error: any, success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string): Promise<void> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blocked, account_status, account_type, account_id, role_level, organization_id')
        .eq('id', userId)
        .single();
      
      // Check if account is blocked
      setIsBlocked(profile?.is_blocked || false);
      
      if (profile?.is_blocked) {
        toast({
          title: "Account Blocked",
          description: "Your account has been blocked. Please contact support.",
          variant: "destructive"
        });
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setUserRole(data.role);
      setIsAdmin(data.role === 'admin' || data.role === 'super_admin' || data.role === 'corporate_admin');
      setIsSuperAdmin(data.role === 'super_admin');
      
      // Check subscription expiry
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('expires_at, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
        
      if (subscription?.expires_at) {
        const expiryDate = new Date(subscription.expires_at);
        const expired = expiryDate < new Date();
        setIsExpired(expired);
        
        if (expired) {
          toast({
            title: "Subscription Expired",
            description: "Your subscription has expired. Please renew to continue using all features.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  };

  const signUp = async (phone: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Verification code sent",
        description: "Please check your phone for the OTP code.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (phone: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back to M-Leja!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyOTP = async (phone: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Phone verified",
        description: "Your account has been verified successfully!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const resendOTP = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole(null);

      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Even if there's an error, we've already cleared the local state
      // so the user is effectively logged out
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });

      // Navigate to auth page
      navigate('/auth');
    } catch (error: any) {
      // Even on error, clear state and navigate
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole(null);
      
      console.error('Logout error:', error);
      
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });

      // Navigate to auth page regardless
      navigate('/auth');
    }
  };

  const createRBACUser = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: string,
    accountType?: string,
    accountId?: string,
    roleLevel?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Get current user's profile for account context
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type, account_id, organization_id')
        .eq('id', user?.id)
        .single();

      const currentAccountType = accountType || profile?.account_type || 'subscription';
      const currentAccountId = accountId || profile?.account_id;
      const currentRoleLevel = roleLevel || 'user';

      const SUPABASE_URL = "https://cfuolhkzxsxfovalswhp.supabase.co";

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-rbac-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            role,
            organizationId: profile?.organization_id,
            accountType: currentAccountType,
            accountId: currentAccountId,
            roleLevel: currentRoleLevel
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create RBAC user');
      }

      toast({
        title: "User Created",
        description: `RBAC user ${fullName} has been created successfully.`,
      });

      return { error: null, user: result.user };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create RBAC user",
        variant: "destructive",
      });
      return { error, user: null };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (fullName: string, phoneNumber?: string) => {
    try {
      if (!user) throw new Error("No user logged in");

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // Update profile table
      const updateData: any = { full_name: fullName };
      if (phoneNumber) updateData.phone_number = phoneNumber;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Super Admin function to reset any user's password
  const resetUserPassword = async (userId: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId, newPassword }
      });

      if (error) throw error;
      
      toast({
        title: "Password Reset",
        description: "User password has been successfully reset.",
      });
      
      return { error: null, success: true };
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset user password",
        variant: "destructive",
      });
      return { error, success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSuperAdmin,
        userRole,
        isBlocked,
        isExpired,
        signUp,
        signIn,
        signOut,
        verifyOTP,
        resendOTP,
        createRBACUser,
        updatePassword,
        updateProfile,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
