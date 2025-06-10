
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import { fetchBorrowRequests, updateBorrowRequestStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type BorrowRequest = {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'faculty' | 'librarian' | 'admin' | 'guest';
  bookId: string;
  bookTitle: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  reviewNote?: string;
  dueAmount?: number;
};

const BorrowRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['borrow-requests'],
    queryFn: fetchBorrowRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, status, reviewNote }: { 
      requestId: string; 
      status: 'approved' | 'rejected'; 
      reviewNote?: string 
    }) => updateBorrowRequestStatus(requestId, status, reviewNote),
    onSuccess: (data, variables) => {
      toast.success(`Request ${variables.status} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewNote('');
    },
    onError: () => {
      toast.error("Failed to update request. Please try again.");
    }
  });

  const handleQuickApprove = (request: BorrowRequest) => {
    updateStatusMutation.mutate({
      requestId: request.id,
      status: 'approved'
    });
  };

  const handleQuickReject = (request: BorrowRequest) => {
    updateStatusMutation.mutate({
      requestId: request.id,
      status: 'rejected'
    });
  };

  const handleReviewWithNote = (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    updateStatusMutation.mutate({
      requestId: selectedRequest.id,
      status,
      reviewNote: reviewNote.trim() || undefined
    });
  };

  const openReviewDialog = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setReviewNote('');
    setIsReviewDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: "bg-blue-50 text-blue-700 border-blue-200",
      faculty: "bg-green-50 text-green-700 border-green-200",
      guest: "bg-purple-50 text-purple-700 border-purple-200",
      librarian: "bg-orange-50 text-orange-700 border-orange-200",
      admin: "bg-red-50 text-red-700 border-red-200"
    };
    
    return (
      <Badge variant="outline" className={colors[role as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading borrow requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const reviewedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Borrow Requests Management</h1>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-700">
            Pending Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((request: BorrowRequest) => (
                <Card key={request.id} className="border-yellow-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.bookTitle}</CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p><strong>Requested by:</strong> {request.userName}</p>
                          {getRoleBadge(request.userRole)}
                        </div>
                        <p><strong>Email:</strong> {request.requestedBy}</p>
                        <p><strong>Date:</strong> {new Date(request.requestDate).toLocaleDateString()}</p>
                        
                        {/* Show due amount for students */}
                        {request.userRole === 'student' && request.dueAmount !== undefined && (
                          <div className={`mt-2 p-2 rounded ${request.dueAmount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            <div className="flex items-center gap-1">
                              {request.dueAmount > 0 && <AlertCircle className="h-3 w-3" />}
                              <p className="text-xs font-medium">
                                Current Due: ₹{request.dueAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => handleQuickApprove(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleQuickReject(request)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                      
                      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => openReviewDialog(request)}
                          >
                            Review with Note
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No pending requests</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reviewed Requests */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Recently Reviewed ({reviewedRequests.length})
          </h2>
          {reviewedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewedRequests.map((request: BorrowRequest) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.bookTitle}</CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p><strong>Requested by:</strong> {request.userName}</p>
                          {getRoleBadge(request.userRole)}
                        </div>
                        <p><strong>Date:</strong> {new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                      {request.reviewNote && (
                        <div className="text-sm bg-gray-50 p-2 rounded">
                          <p><strong>Review Note:</strong></p>
                          <p className="text-gray-600">{request.reviewNote}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No reviewed requests</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Borrow Request</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium">{selectedRequest.bookTitle}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600">Requested by: {selectedRequest.userName}</p>
                    {getRoleBadge(selectedRequest.userRole)}
                  </div>
                  <p className="text-sm text-gray-600">Date: {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                  
                  {selectedRequest.userRole === 'student' && selectedRequest.dueAmount !== undefined && (
                    <div className={`mt-2 p-2 rounded ${selectedRequest.dueAmount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      <div className="flex items-center gap-1">
                        {selectedRequest.dueAmount > 0 && <AlertCircle className="h-4 w-4" />}
                        <p className="text-sm font-medium">
                          Current Due Amount: ₹{selectedRequest.dueAmount.toFixed(2)}
                        </p>
                      </div>
                      {selectedRequest.dueAmount > 0 && (
                        <p className="text-xs mt-1">Student has outstanding fines that should be cleared.</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="reviewNote">Review Note (Optional)</Label>
                  <Textarea
                    id="reviewNote"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add a note explaining your decision..."
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleReviewWithNote('approved')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReviewWithNote('rejected')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BorrowRequests;
