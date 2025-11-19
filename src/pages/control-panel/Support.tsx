import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  user_id: string;
  assigned_to: string | null;
  created_at: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as SupportTicket[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ assigned_to: user?.id, status: 'in_progress' })
        .eq('id', ticketId);

      if (error) throw error;
      toast({ title: "Ticket Assigned" });
      fetchTickets();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : tickets.length === 0 ? (
            <Card><CardContent className="py-8 text-center"><AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" /><p className="text-muted-foreground">No tickets</p></CardContent></Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-4 w-4" />{ticket.subject}</CardTitle>
                    <div className="flex gap-2">
                      <Badge>{ticket.priority}</Badge>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{ticket.description}</p>
                  {ticket.status === 'open' && <Button size="sm" onClick={() => handleAssignTicket(ticket.id)}>Assign to Me</Button>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
