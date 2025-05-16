
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  appointmentId?: string | number;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  date: string;
  doctorId?: string;
  status?: string;
  followupDate?: string;
  doctorSignature?: string; // Added doctor signature field
}

interface PrescriptionsListProps {
  userId: string;
  userRole: 'doctor' | 'user';
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ userId, userRole }) => {
  const { toast } = useToast();
  
  // Get prescriptions based on role
  const getPrescriptions = () => {
    if (userRole === 'doctor') {
      // For doctors, get all prescriptions they created
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      // Add doctor signature to prescriptions if available
      const doctorSignature = localStorage.getItem(`doctor_signature_${userId}`);
      if (doctorSignature) {
        return allPrescriptions.map((p: Prescription) => {
          if (p.doctorId === userId && !p.doctorSignature) {
            return { ...p, doctorSignature };
          }
          return p;
        });
      }
      return allPrescriptions;
    } else {
      // For patients, get only their prescriptions
      return JSON.parse(localStorage.getItem(`prescriptions_${userId}`) || '[]');
    }
  };

  const prescriptions = getPrescriptions();

  const updatePrescriptionStatus = (prescriptionId: string, newStatus: string) => {
    // Update the prescription status
    const updatedPrescriptions = prescriptions.map((p: Prescription) => {
      if (p.id === prescriptionId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    
    // Save back to localStorage
    localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));
    if (userRole === 'user') {
      localStorage.setItem(`prescriptions_${userId}`, JSON.stringify(updatedPrescriptions));
    }
    
    toast({
      title: "Status Updated",
      description: `Prescription status changed to ${newStatus}`,
    });
  };

  const printPrescription = (prescription: Prescription) => {
    // Create a printable version of the prescription
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${prescription.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .footer { margin-top: 30px; text-align: right; }
              .status { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
              .status-active { background-color: #d1fae5; color: #065f46; }
              .status-pending { background-color: #fef3c7; color: #92400e; }
              .status-completed { background-color: #e0e7ff; color: #3730a3; }
              .signature { height: 60px; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">Medical Prescription</div>
                <div>MediClinic Healthcare Services</div>
              </div>
              <div>
                <div>Date: ${new Date(prescription.date).toLocaleDateString()}</div>
                <div>Prescription ID: ${prescription.id}</div>
                <div class="status status-${prescription.status || 'active'}">
                  Status: ${prescription.status || 'Active'}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Patient Information</div>
              <div>Name: ${prescription.patientName}</div>
              <div>Patient ID: ${prescription.patientId}</div>
              ${prescription.appointmentId ? `<div>Appointment ID: ${prescription.appointmentId}</div>` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">Diagnosis</div>
              <div>${prescription.diagnosis}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Medications</div>
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  ${prescription.medicines.map(med => `
                    <tr>
                      <td>${med.name}</td>
                      <td>${med.dosage}</td>
                      <td>${med.frequency}</td>
                      <td>${med.duration}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            ${prescription.instructions ? `
              <div class="section">
                <div class="section-title">Additional Instructions</div>
                <div>${prescription.instructions}</div>
              </div>
            ` : ''}
            
            ${prescription.followupDate ? `
              <div class="section">
                <div class="section-title">Follow-up Appointment</div>
                <div>${new Date(prescription.followupDate).toLocaleDateString()}</div>
              </div>
            ` : ''}
            
            <div class="footer">
              <div>Doctor's Signature</div>
              ${prescription.doctorSignature ? 
                `<img src="${prescription.doctorSignature}" class="signature" alt="Doctor's signature" />` : 
                `<div>____________________</div>`
              }
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">No Prescriptions</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {userRole === 'doctor' 
            ? "You haven't created any prescriptions yet." 
            : "You don't have any prescriptions yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription: Prescription) => (
        <Card key={prescription.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-card border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    Prescription for {prescription.patientName}
                    {prescription.patientId && <span className="text-xs text-muted-foreground ml-2">ID: {prescription.patientId}</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(prescription.date).toLocaleDateString()}
                    {prescription.appointmentId && prescription.appointmentId !== 'none' && (
                      <span className="ml-2 text-primary">Appointment #{prescription.appointmentId}</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {userRole === 'doctor' && (
                    <Select 
                      value={prescription.status || 'active'}
                      onValueChange={(value) => updatePrescriptionStatus(prescription.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {userRole === 'user' && (
                    <Badge variant={
                      prescription.status === 'pending' ? 'outline' : 
                      prescription.status === 'completed' ? 'secondary' : 
                      'default'
                    }>
                      {prescription.status || 'Active'}
                    </Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => printPrescription(prescription)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Diagnosis</h4>
                <p className="text-sm">{prescription.diagnosis}</p>
              </div>
              <Separator className="my-3" />
              <div>
                <h4 className="text-sm font-medium mb-2">Medications</h4>
                <div className="space-y-2">
                  {prescription.medicines.map((medicine, i) => (
                    <div key={i} className="bg-muted/30 p-2 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{medicine.name}</span>
                        <span>{medicine.dosage}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {medicine.frequency} · {medicine.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {prescription.instructions && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Additional Instructions</h4>
                    <p className="text-sm">{prescription.instructions}</p>
                  </div>
                </>
              )}
              {prescription.followupDate && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Follow-up Appointment</h4>
                    <div className="flex items-center text-sm text-primary">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(prescription.followupDate).toLocaleDateString()}
                    </div>
                  </div>
                </>
              )}
              {prescription.doctorSignature && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Doctor's Signature</h4>
                    <div className="flex justify-end mt-2">
                      <img 
                        src={prescription.doctorSignature} 
                        alt="Doctor's signature"
                        className="h-14" 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrescriptionsList;
