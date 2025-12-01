import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  showIcon?: boolean;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, showIcon = true, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <div className="relative">
          {showIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="h-4 w-4" />
            </div>
          )}
          <Input
            ref={ref}
            type="tel"
            placeholder="+254712345678"
            inputMode="tel"
            autoComplete="tel"
            className={cn(
              showIcon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
