import { Badge } from "@/components/ui/badge";
import { Check, Shield, Crown, Building2, Landmark, Briefcase, TrendingUp, Users } from "lucide-react";

interface SubscriptionBadgeProps {
  tier: string;
  isVerified?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const SubscriptionBadge = ({ 
  tier, 
  isVerified = false,
  className = "",
  showIcon = true 
}: SubscriptionBadgeProps) => {
  const getBadgeConfig = (tierName: string) => {
    const tierLower = tierName.toLowerCase();
    
    // Government tier - highest priority
    if (tierLower.includes('government')) {
      return {
        label: 'Government',
        color: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white border-blue-900',
        icon: Landmark
      };
    }
    
    // Corporate tier
    if (tierLower.includes('corporate') || tierLower === 'ceo') {
      return {
        label: 'Corporate',
        color: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white border-purple-900',
        icon: Building2
      };
    }
    
    // Enterprise tier
    if (tierLower.includes('enterprise') || tierLower === 'cfo' || tierLower === 'director') {
      return {
        label: 'Enterprise',
        color: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-900',
        icon: Crown
      };
    }
    
    // Professional tier
    if (tierLower.includes('professional') || tierLower.includes('senior_manager')) {
      return {
        label: 'Professional',
        color: 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white border-emerald-900',
        icon: Briefcase
      };
    }
    
    // Standard tier
    if (tierLower.includes('standard') || tierLower.includes('assistant_manager') || tierLower.includes('supervisor')) {
      return {
        label: 'Standard',
        color: 'bg-gradient-to-r from-cyan-600 to-cyan-800 text-white border-cyan-900',
        icon: TrendingUp
      };
    }
    
    // Basic tier
    if (tierLower.includes('basic') || tierLower.includes('cashier') || tierLower.includes('sales_agent')) {
      return {
        label: 'Basic',
        color: 'bg-gradient-to-r from-slate-600 to-slate-800 text-white border-slate-900',
        icon: Users
      };
    }
    
    // Free trial - default
    return {
      label: 'Free Trial',
      color: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white border-gray-800',
      icon: Shield
    };
  };

  const config = getBadgeConfig(tier);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${className} flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold shadow-md`}>
      {showIcon && <Icon className="h-4 w-4" />}
      <span>{config.label}</span>
      {isVerified && <Check className="h-4 w-4 ml-1 animate-pulse" />}
    </Badge>
  );
};
