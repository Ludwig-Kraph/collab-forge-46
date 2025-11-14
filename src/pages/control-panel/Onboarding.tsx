import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Building, Phone, Mail, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RegistrationRequest {
  id: string;
  business_name: string;
  business_type: string;
  contact_person: string;
  email: string;
  phone_number: string;
  mpesa_account_type: string;
  mpesa_account_number: string;
  requested_tier: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('registration_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'registration_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const handleValidateCredentials = async (request: RegistrationRequest) => {
    setValidating(true);
    setValidationResult(null);

    try {
      // Simulate MPESA credential validation
      // In production, this would call MPESA Daraja API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('mpesa_credential_validations')
        .insert({
          registration_request_id: request.id,
          validation_type: 'stk_push_test',
          status: 'passed',
          test_phone_number: request.phone_number,
          test_amount: 1,
          validated_by: user?.id
        });

      if (error) throw error;

      setValidationResult('passed');
      toast({
        title: "Validation Successful",
        description: "MPESA credentials have been validated successfully."
      });
    } catch (error: any) {
      setValidationResult('failed');
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          notes: reviewNotes
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: `Registration for ${selectedRequest.business_name} has been approved.`
      });

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewNotes("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('registration_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: `Registration for ${selectedRequest.business_name} has been rejected.`
      });

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openReviewDialog = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
    setValidationResult(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'under_review':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterRequestsByStatus = (status: string) => {
    return requests.filter(req => req.status === status);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Client Onboarding</h1>
          <p className="text-muted-foreground">Review and approve registration requests</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({filterRequestsByStatus('pending').length})
            </TabsTrigger>
            <TabsTrigger value="under_review">
              Under Review ({filterRequestsByStatus('under_review').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({filterRequestsByStatus('approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({filterRequestsByStatus('rejected').length})
            </TabsTrigger>
          </TabsList>

          {['pending', 'under_review', 'approved', 'rejected'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Loading requests...</p>
                  </CardContent>
                </Card>
              ) : filterRequestsByStatus(status).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No {status} requests</p>
                  </CardContent>
                </Card>
              ) : (
                filterRequestsByStatus(status).map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{request.business_name}</CardTitle>
                            <CardDescription>{request.business_type || 'Business'}</CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{request.contact_person}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>{request.mpesa_account_type.toUpperCase()} - {request.mpesa_account_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{request.requested_tier}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </span>
                          {(status === 'pending' || status === 'under_review') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(request)}
                            >
                              Review Request
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Registration Request</DialogTitle>
              <DialogDescription>
                Validate credentials and approve or reject the registration
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium">Business Name:</span>
                      <span>{selectedRequest.business_name}</span>
                      <span className="font-medium">Contact Person:</span>
                      <span>{selectedRequest.contact_person}</span>
                      <span className="font-medium">Email:</span>
                      <span>{selectedRequest.email}</span>
                      <span className="font-medium">Phone:</span>
                      <span>{selectedRequest.phone_number}</span>
                      <span className="font-medium">Requested Tier:</span>
                      <Badge variant="outline">{selectedRequest.requested_tier}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* MPESA Credential Validation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MPESA Credential Validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium">Account Type:</span>
                      <span>{selectedRequest.mpesa_account_type.toUpperCase()}</span>
                      <span className="font-medium">Account Number:</span>
                      <span>{selectedRequest.mpesa_account_number}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidateCredentials(selectedRequest)}
                        disabled={validating}
                      >
                        {validating ? "Validating..." : "Test STK Push"}
                      </Button>
                      {validationResult && (
                        <Badge variant={validationResult === 'passed' ? 'default' : 'destructive'}>
                          {validationResult === 'passed' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                          {validationResult === 'passed' ? 'Validation Passed' : 'Validation Failed'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this registration..."
                    rows={3}
                  />
                </div>

                {/* Rejection Reason (if rejecting) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setReviewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectRequest}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={handleApproveRequest}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
