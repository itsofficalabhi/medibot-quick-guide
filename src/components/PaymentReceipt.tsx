
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Receipt {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

interface PaymentReceiptProps {
  userId: string;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ userId }) => {
  // In a real app, this would come from a database
  const receipts = JSON.parse(localStorage.getItem(`receipts_${userId}`) || '[]');

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">No Payment Records</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          You don't have any payment records yet.
        </p>
      </div>
    );
  }

  const printReceipt = (receipt: Receipt) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${receipt.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .subtitle { font-size: 16px; color: #666; }
              .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .info-column { width: 48%; }
              .label { font-weight: bold; margin-bottom: 5px; }
              .value { margin-bottom: 15px; }
              .amount { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
              .footer { margin-top: 50px; text-align: center; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Payment Receipt</div>
              <div class="subtitle">MediClinic Healthcare Services</div>
            </div>
            
            <div class="info">
              <div class="info-column">
                <div class="label">Receipt No:</div>
                <div class="value">${receipt.id}</div>
                
                <div class="label">Date:</div>
                <div class="value">${new Date(receipt.date).toLocaleDateString()}</div>
                
                <div class="label">Payment Method:</div>
                <div class="value">${receipt.paymentMethod}</div>
              </div>
              
              <div class="info-column">
                <div class="label">Patient Name:</div>
                <div class="value">${receipt.patientName}</div>
                
                <div class="label">Doctor:</div>
                <div class="value">${receipt.doctorName}</div>
              </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Description</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    ${receipt.appointmentType} Consultation with ${receipt.doctorName}<br>
                    <span style="font-size: 14px; color: #666;">
                      ${receipt.appointmentDate} at ${receipt.appointmentTime}
                    </span>
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
                    $${(receipt.amount - 5).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    Platform Fee
                  </td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
                    $5.00
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="font-weight: bold;">
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
                    $${receipt.amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <div class="footer">
              Thank you for choosing MediClinic for your healthcare needs.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      {receipts.map((receipt: Receipt) => (
        <Card key={receipt.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-card border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Payment Receipt: {receipt.appointmentType} Consultation</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(receipt.date).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => printReceipt(receipt)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Doctor</h4>
                  <p className="text-sm">{receipt.doctorName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Appointment</h4>
                  <p className="text-sm">
                    {receipt.appointmentDate} at {receipt.appointmentTime}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Payment Method</h4>
                  <p className="text-sm">{receipt.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Receipt ID</h4>
                  <p className="text-sm">{receipt.id}</p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-lg font-bold">${receipt.amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentReceipt;
