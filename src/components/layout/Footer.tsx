import { getCopyrightText } from "@/utils/copyright";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-6 md:py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {getCopyrightText()}
            </p>
            <p className="text-sm font-semibold text-foreground">
              Developed by Timothy Ng'ang'a
            </p>
            <p className="text-xs text-muted-foreground">
              Source code fully owned as is property of developer.
            </p>
          </div>
          
          <div className="border-t pt-4 w-full max-w-2xl">
            <p className="text-xs text-destructive font-medium mb-2">
              ⚠️ LEGAL NOTICE
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Forking, cloning, or using this code without proper licensing will incur a 
              <span className="font-semibold text-foreground"> USD $1,000,000 damage fee</span>.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              For licensing inquiries, contact:{" "}
              <a 
                href="https://nassirgroup.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Nassir Group
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
