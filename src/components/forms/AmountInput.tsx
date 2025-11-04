import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  currency?: string;
  onValueChange?: (value: number) => void;
}

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label, error, currency = "KES", onValueChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    const formatNumber = (value: string): string => {
      const number = value.replace(/[^\d]/g, "");
      if (!number) return "";
      return Number(number).toLocaleString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d]/g, "");
      const numericValue = Number(rawValue);
      
      setDisplayValue(formatNumber(rawValue));
      onValueChange?.(numericValue);
    };

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
            {currency}
          </div>
          <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="0"
            className={cn(
              "pl-16 font-mono-numbers text-lg",
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

AmountInput.displayName = "AmountInput";

export { AmountInput };
