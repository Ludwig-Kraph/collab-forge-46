import { getCopyrightText } from "@/utils/copyright";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-6 md:py-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {getCopyrightText()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
