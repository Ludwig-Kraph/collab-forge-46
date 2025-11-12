import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle, Book, Video, Mail, Phone, FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const faqCategories = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I set up my first MPESA account?",
        answer:
          "To set up your first MPESA account, go to Settings > Linked Accounts > Add New Account. Select your account type (Till, Paybill, or Pochi la Biashara), enter your account details, and verify ownership through an SMS code.",
      },
      {
        question: "What is an STK push?",
        answer:
          "STK push (SIM Toolkit Push) is a feature that sends a payment prompt directly to your customer's phone. They simply enter their MPESA PIN to complete the payment - no need to remember account numbers or navigate MPESA menus.",
      },
      {
        question: "How do I invite team members?",
        answer:
          "Navigate to More > User Management and click 'Invite User'. Enter their email address, select their role (Admin, Manager, or User), and send the invitation. They'll receive an email with setup instructions.",
      },
    ],
  },
  {
    category: "Payments & Transactions",
    questions: [
      {
        question: "How do I trigger a payment request?",
        answer:
          "Click the '+' button on the dashboard or navigate to the Payments tab. Enter the customer's phone number and amount, select your MPESA account, and click 'Send Payment Request'. Your customer will receive an instant prompt on their phone.",
      },
      {
        question: "What happens if a payment fails?",
        answer:
          "Failed payments are automatically logged in your transaction history with a 'Failed' status. Common reasons include insufficient funds, wrong PIN, or timeout. You can retry the payment or contact the customer directly.",
      },
      {
        question: "Can I export my transaction history?",
        answer:
          "Yes! Go to Transactions, use the filters to select your desired date range and criteria, then click the 'Export' button. You can download your data in CSV, Excel, or PDF format.",
      },
    ],
  },
  {
    category: "Subscription & Billing",
    questions: [
      {
        question: "How do I upgrade my subscription?",
        answer:
          "Visit More > Subscription to view available plans. Click 'Upgrade' on your desired tier, review the changes, and complete the payment. Your new limits will be active immediately.",
      },
      {
        question: "What happens when I reach my STK push limit?",
        answer:
          "When you approach your monthly limit, you'll receive notifications. Once reached, you can either upgrade your plan or wait until your next billing cycle. Emergency top-ups are also available.",
      },
      {
        question: "Can I cancel my subscription?",
        answer:
          "Yes, you can downgrade or cancel anytime from the Subscription page. Your service will continue until the end of your current billing period.",
      },
    ],
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredFAQs = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Support request submitted! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to your questions or get in touch with our support team
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card 
            className="transition-smooth hover:shadow-elegant cursor-pointer"
            onClick={() => navigate('/how-to')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">How to Guide</h3>
                <p className="text-sm text-muted-foreground">Registration & Setup</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-elegant cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">User Guide</h3>
                <p className="text-sm text-muted-foreground">Step-by-step tutorials</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-elegant cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Video className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground">Watch and learn</p>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-elegant cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Chat with support</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find quick answers to common questions</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredFAQs.map((category) => (
              <div key={category.category} className="mb-6 last:mb-0">
                {category.questions.length > 0 && (
                  <>
                    <h3 className="mb-3 font-semibold text-lg">{category.category}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.category}-${index}`}>
                          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Send us a message and we'll respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
              <CardDescription>Choose your preferred contact method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-1">support@mleja.co.ke</p>
                  <p className="text-xs text-muted-foreground">Response time: 2-4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <Phone className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-1">+254 700 123 456</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri: 8AM - 6PM EAT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp Business</h3>
                  <p className="text-sm text-muted-foreground mb-1">+254 711 234 567</p>
                  <p className="text-xs text-muted-foreground">24/7 automated assistance</p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/20 p-4 mt-6">
                <h3 className="font-semibold mb-2">Emergency Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  For critical issues affecting your business operations
                </p>
                <Button variant="outline" className="w-full">
                  Request Emergency Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
