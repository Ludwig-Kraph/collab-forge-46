import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

const FloatingActionButton = ({ 
  to = "/payment", 
  onClick, 
  className,
  label = "New Payment"
}: FloatingActionButtonProps) => {
  const buttonContent = (
    <>
      <Plus className="h-6 w-6" />
      <span className="sr-only">{label}</span>
    </>
  );

  const baseClasses = cn(
    "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-elegant hover:shadow-glow md:bottom-6",
    "bg-gradient-primary transition-smooth",
    className
  );

  if (onClick) {
    return (
      <Button
        onClick={onClick}
        size="icon"
        className={baseClasses}
      >
        {buttonContent}
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="icon"
      className={baseClasses}
    >
      <Link to={to}>
        {buttonContent}
      </Link>
    </Button>
  );
};

export default FloatingActionButton;
