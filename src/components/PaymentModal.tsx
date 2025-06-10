
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { payFine } from "@/lib/api";

// Add Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  amount: number;
  bookTitle: string;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ 
  isOpen, 
  setIsOpen, 
  amount, 
  bookTitle,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Create an order with our backend
      const order = await payFine(amount * 100); // Convert to smallest currency unit
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }
      
      // Create a new Razorpay instance
      const razorpay = new window.Razorpay({
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with actual test key
        amount: order.amount,
        currency: 'INR',
        name: 'Library Management System',
        description: `Fine payment for: ${bookTitle}`,
        order_id: order.id,
        handler: function(response: any) {
          toast.success('Payment successful!');
          setIsOpen(false);
          onPaymentSuccess();
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#3B82F6',
        },
      });
      
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Fine</DialogTitle>
          <DialogDescription>
            Pay the fine for the overdue book: {bookTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-2xl font-bold">₹{amount.toFixed(2)}</p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pay using UPI, cards, or net banking
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
