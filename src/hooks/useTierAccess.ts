import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';

interface TierFeatures {
  maxUsers: number | null; // null = unlimited
  maxStkPushes: number | null; // null = unlimited
  multiOutlet: boolean;
  analytics: boolean;
  advancedAnalytics: boolean;
  departments: boolean;
  rbacManagement: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  exportData: boolean;
  automations: boolean;
}

const TIER_FEATURES: Record<string, TierFeatures> = {
  free_trial: {
    maxUsers: 1,
    maxStkPushes: 3,
    multiOutlet: false,
    analytics: true,
    advancedAnalytics: false,
    departments: false,
    rbacManagement: false,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    exportData: false,
    automations: false,
  },
  basic: {
    maxUsers: 3,
    maxStkPushes: 100,
    multiOutlet: false,
    analytics: true,
    advancedAnalytics: false,
    departments: false,
    rbacManagement: true,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    exportData: true,
    automations: false,
  },
  standard: {
    maxUsers: 10,
    maxStkPushes: 500,
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    exportData: true,
    automations: true,
  },
  professional: {
    maxUsers: 25,
    maxStkPushes: 2000,
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    exportData: true,
    automations: true,
  },
  enterprise: {
    maxUsers: null, // unlimited
    maxStkPushes: null, // unlimited
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    exportData: true,
    automations: true,
  },
  corporate: {
    maxUsers: null,
    maxStkPushes: null,
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    exportData: true,
    automations: true,
  },
  government: {
    maxUsers: null,
    maxStkPushes: null,
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    exportData: true,
    automations: true,
  },
  super_admin: {
    maxUsers: null,
    maxStkPushes: null,
    multiOutlet: true,
    analytics: true,
    advancedAnalytics: true,
    departments: true,
    rbacManagement: true,
    apiAccess: true,
    prioritySupport: true,
    customBranding: true,
    exportData: true,
    automations: true,
  },
};

export const useTierAccess = () => {
  const { user, isSuperAdmin } = useAuth();
  const { subscription } = useRealtimeSubscription(user?.id);

  const tierFeatures = useMemo(() => {
    if (isSuperAdmin) {
      return TIER_FEATURES.super_admin;
    }
    
    if (!subscription) {
      return TIER_FEATURES.free_trial;
    }

    return TIER_FEATURES[subscription.tier] || TIER_FEATURES.free_trial;
  }, [subscription?.tier, isSuperAdmin]);

  const hasFeature = (feature: keyof TierFeatures): boolean => {
    return tierFeatures[feature] === true;
  };

  const canAddUsers = useMemo(() => {
    if (isSuperAdmin || tierFeatures.maxUsers === null) return true;
    // Would need to fetch current user count and compare
    return true; // Placeholder
  }, [tierFeatures.maxUsers, isSuperAdmin]);

  const canUseStkPush = useMemo(() => {
    if (isSuperAdmin || tierFeatures.maxStkPushes === null) return true;
    if (!subscription) return false;
    
    return subscription.free_stk_pushes_remaining > 0 || 
           (subscription.max_stk_pushes !== null && 
            subscription.used_stk_pushes < subscription.max_stk_pushes);
  }, [subscription, tierFeatures.maxStkPushes, isSuperAdmin]);

  return {
    tierFeatures,
    hasFeature,
    canAddUsers,
    canUseStkPush,
    currentTier: subscription?.tier || 'free_trial',
    isUnlimited: tierFeatures.maxStkPushes === null,
  };
};
