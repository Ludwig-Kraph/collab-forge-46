import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  length?: number;
  className?: string;
}

const OTPInput = ({ 
  value, 
  onChange, 
  label, 
  error, 
  length = 6,
  className 
}: OTPInputProps) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className={cn("flex justify-center", className)}>
        <InputOTP
          maxLength={length}
          value={value}
          onChange={onChange}
        >
          <InputOTPGroup>
            {Array.from({ length }).map((_, index) => (
              <InputOTPSlot 
                key={index} 
                index={index}
                className={cn(
                  "h-12 w-12 text-lg font-mono-numbers",
                  error && "border-destructive"
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export { OTPInput };
