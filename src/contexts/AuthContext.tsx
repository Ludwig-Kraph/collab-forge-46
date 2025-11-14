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
  signUp: (phone: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  resendOTP: (phone: string) => Promise<{ error: any }>;
  createRBACUser: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any, user: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (fullName: string, phoneNumber?: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user role after auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setUserRole(data.role);
      setIsAdmin(data.role === 'admin' || data.role === 'super_admin' || data.role === 'corporate_admin');
      setIsSuperAdmin(data.role === 'super_admin');
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole(null);

      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createRBACUser = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          is_rbac_user: true
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role: role as any }]);

        if (roleError) throw roleError;

        // Log audit event
        await supabase.rpc('log_audit_event', {
          _action: 'create_rbac_user',
          _entity_type: 'user',
          _entity_id: data.user.id,
          _changes: { role, email, full_name: fullName },
          _ip_address: null,
          _user_agent: navigator.userAgent
        });
      }

      return { error: null, user: data.user };
    } catch (error: any) {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSuperAdmin,
        userRole,
        signUp,
        signIn,
        signOut,
        verifyOTP,
        resendOTP,
        createRBACUser,
        updatePassword,
        updateProfile,
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
