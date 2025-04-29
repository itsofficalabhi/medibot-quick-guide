
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, DollarSign, CreditCard } from 'lucide-react';

interface PaymentGatewayProps {
  amount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  appointmentDate,
  appointmentTime,
  doctorName,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpiryDate(formatExpiryDate(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulating a payment process
    setTimeout(() => {
      setIsProcessing(false);
      
      // Randomly determine success or failure (80% success rate)
      const isSuccess = Math.random() < 0.8;
      
      if (isSuccess) {
        toast({
          title: "Payment Successful",
          description: "Your appointment has been booked successfully.",
          duration: 5000,
        });
        onSuccess();
      } else {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }, 2000);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-primary" />
          Payment Gateway
        </CardTitle>
        <CardDescription>Complete your appointment booking</CardDescription>
      </CardHeader>
      <CardContent>
        {appointmentDate && (
          <div className="mb-4 p-3 bg-primary/10 rounded-md">
            <div className="flex items-start">
              <Calendar className="mr-2 h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Appointment Details</h4>
                <p className="text-sm text-muted-foreground">
                  {appointmentDate} at {appointmentTime}
                </p>
                {doctorName && (
                  <p className="text-sm font-medium mt-1">{doctorName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Amount</span>
            <span className="font-bold">${amount.toFixed(2)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            This is a secure payment. Your card details are encrypted.
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="text-sm font-medium block mb-1">
                Card Number
              </label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  required
                />
                <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <label htmlFor="cardName" className="text-sm font-medium block mb-1">
                Name on Card
              </label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="text-sm font-medium block mb-1">
                  Expiry Date
                </label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label htmlFor="cvv" className="text-sm font-medium block mb-1">
                  CVV
                </label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"></span>
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentGateway;
