
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';

interface PaymentGatewayProps {
  amount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName: string;
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
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Store receipt in localStorage if user is logged in
      if (user) {
        const receipt = {
          id: `receipt-${Date.now()}`,
          patientName: user.name,
          patientId: user.id,
          doctorName: doctorName,
          appointmentType: getAppointmentType(),
          appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
          appointmentTime: appointmentTime || '12:00 PM',
          amount: amount,
          paymentMethod: getPaymentMethodName(),
          date: new Date().toISOString()
        };
        
        // Store in patient-specific receipts
        const userReceipts = JSON.parse(localStorage.getItem(`receipts_${user.id}`) || '[]');
        localStorage.setItem(`receipts_${user.id}`, JSON.stringify([...userReceipts, receipt]));
      }
      
      onSuccess();
    }, 2000);
  };
  
  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'card':
        return 'Credit/Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'bank':
        return 'Bank Transfer';
      default:
        return 'Credit/Debit Card';
    }
  };
  
  const getAppointmentType = () => {
    // Check URL or other context clues to determine appointment type
    const url = window.location.href.toLowerCase();
    if (url.includes('video')) return 'Video Consultation';
    if (url.includes('chat')) return 'Chat Consultation';
    if (url.includes('phone')) return 'Phone Consultation';
    return 'Video Consultation'; // Default
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Appointment Summary</h3>
              <div className="bg-primary/5 p-3 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Doctor:</span>
                  <span className="font-medium">{doctorName}</span>
                </div>
                {appointmentDate && (
                  <div className="flex justify-between mb-1">
                    <span>Date:</span>
                    <span className="font-medium">{appointmentDate}</span>
                  </div>
                )}
                {appointmentTime && (
                  <div className="flex justify-between mb-1">
                    <span>Time:</span>
                    <span className="font-medium">{appointmentTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Choose Payment Method</h3>
              <RadioGroup 
                className="grid grid-cols-3 gap-4"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div>
                  <RadioGroupItem 
                    value="card" 
                    id="card"
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    Card
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="paypal" 
                    id="paypal"
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="paypal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2" viewBox="0 0 24 24" fill="#1672C0">
                      <path d="M9.112 9.168a.57.57 0 0 1-.57.636H7.347a.285.285 0 0 1-.284-.258L6.5 6c0-.139.118-.266.265-.266h1.548c.07 0 .15.049.163.114l.635 3.32Z" />
                      <path d="M9.847 9.714H8.674a.218.218 0 0 0-.217.161l-.145.624-.226 1.462a.2.2 0 0 0 .178.24h.53c.202 0 .371-.15.399-.35l.268-1.149c.027-.201.196-.35.398-.35h.24c1.026 0 1.624-.4 1.765-1.42.063-.417.003-.746-.199-.978-.168-.242-.444-.348-.818-.348Z" />
                      <path d="M5.953 9.714H4.78a.218.218 0 0 0-.217.161l-.145.624-.226 1.462a.2.2 0 0 0 .177.24h1.245a.218.218 0 0 0 .217-.161l.226-1.462.145-.624a.2.2 0 0 0-.177-.24h-.071Z" />
                      <path d="M16.012 9.168a.57.57 0 0 1-.57.636h-1.194a.285.285 0 0 1-.285-.258L13.4 6c0-.139.118-.266.265-.266h1.548c.07 0 .15.049.163.114l.635 3.32Z" />
                      <path d="M16.746 9.714h-1.172a.218.218 0 0 0-.217.161l-.145.624-.226 1.462a.2.2 0 0 0 .178.24h.53c.202 0 .371-.15.399-.35l.268-1.149c.027-.201.196-.35.398-.35h.24c1.026 0 1.624-.4 1.765-1.42.063-.417.003-.746-.199-.978-.168-.242-.444-.348-.818-.348Z" />
                      <path d="M12.853 9.714h-1.172a.218.218 0 0 0-.217.161l-.145.624-.226 1.462a.2.2 0 0 0 .177.24h1.245a.218.218 0 0 0 .217-.161l.226-1.462.145-.624a.2.2 0 0 0-.177-.24h-.072Z" />
                    </svg>
                    PayPal
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="bank" 
                    id="bank"
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="bank"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Bank
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input 
                    id="cardName" 
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input 
                      id="cardExpiry" 
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input 
                      id="cardCvc" 
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'paypal' && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}
            
            {paymentMethod === 'bank' && (
              <div className="text-sm p-4 bg-muted rounded-md">
                <p className="font-medium mb-2">Bank Transfer Details</p>
                <p className="mb-1"><span className="font-medium">Bank:</span> MediClinic Bank</p>
                <p className="mb-1"><span className="font-medium">Account Name:</span> MediClinic Healthcare</p>
                <p className="mb-1"><span className="font-medium">Account Number:</span> 12345678</p>
                <p className="mb-3"><span className="font-medium">Reference:</span> MED-{Date.now().toString().slice(-6)}</p>
                <p className="text-xs text-muted-foreground">Please use the reference number above when making your transfer.</p>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consultation Fee</span>
                <span className="font-medium">${amount - 5}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span className="font-medium">$5</span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2">
                <span>Total Amount</span>
                <span>${amount}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay $${amount}`}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentGateway;
