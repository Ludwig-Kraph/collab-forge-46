import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Crown, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  tier: string;
  isVerified?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const SubscriptionBadge = ({ 
  tier, 
  isVerified = false, 
  className,
  showIcon = true 
}: SubscriptionBadgeProps) => {
  const getBadgeConfig = (tier: string) => {
    switch (tier) {
      case 'free_trial':
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'Free Trial',
          icon: AlertCircle
        };
      case 'basic':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          label: 'Basic',
          icon: Zap
        };
      case 'standard':
        return {
          color: 'bg-green-100 text-green-700 border-green-300',
          label: 'Standard',
          icon: CheckCircle
        };
      case 'professional':
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-300',
          label: 'Professional',
          icon: Star
        };
      case 'enterprise':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-300',
          label: 'Enterprise',
          icon: Crown
        };
      case 'corporate':
        return {
          color: 'bg-rose-100 text-rose-700 border-rose-300',
          label: 'Corporate',
          icon: Crown
        };
      case 'government':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-300',
          label: 'Government',
          icon: Crown
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          label: tier,
          icon: AlertCircle
        };
    }
  };

  const config = getBadgeConfig(tier);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        className={cn(
          "font-semibold border-2",
          config.color,
          className
        )}
      >
        {showIcon && <Icon className="w-3 h-3 mr-1" />}
        {config.label}
      </Badge>
      {isVerified && (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
    </div>
  );
};
