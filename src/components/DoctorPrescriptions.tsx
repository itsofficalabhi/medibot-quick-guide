
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { prescriptionsAPI } from '@/services/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Search, ClipboardEdit } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DoctorPrescriptionsProps {
  doctorId?: string;
  doctorSignature?: string;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionFormData {
  patientId: string;
  diagnosis: string;
  instructions: string;
  medicines: Medicine[];
  followupDate?: string;
}

interface Patient {
  id: string;
  name: string;
}

const DoctorPrescriptions: React.FC<DoctorPrescriptionsProps> = ({ doctorId, doctorSignature }) => {
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);
  
  const [newPrescription, setNewPrescription] = useState<PrescriptionFormData>({
    patientId: '',
    diagnosis: '',
    instructions: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
  });

  // Fetch patients for doctor
  const { data: patients } = useQuery({
    queryKey: ['doctorPatients', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      try {
        // Query profiles directly
        const { data: profilesData, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name');

        if (profilesData?.length) {
          return profilesData.map(p => ({
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'
          }));
        }
        
        // Fallback to mock data
        return [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
          { id: '3', name: 'Robert Johnson' }
        ];
      } catch (error) {
        console.error('Error fetching patients:', error);
        return [];
      }
    },
    enabled: !!doctorId,
  });

  // Fetch prescriptions for doctor
  const { data: prescriptions, isLoading, refetch } = useQuery({
    queryKey: ['doctorPrescriptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      
      try {
        // Try Supabase direct query
        const { data: supabasePrescriptions, error } = await supabase
          .from('prescriptions')
          .select(`
            *,
            patient_id
          `)
          .eq('doctor_id', doctorId);

        if (supabasePrescriptions?.length) {
          // Get patient names separately
          const patientIds = supabasePrescriptions
            .map(p => p.patient_id)
            .filter(Boolean);
            
          let patientNames: Record<string, string> = {};
          
          if (patientIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', patientIds);
              
            if (profilesData?.length) {
              patientNames = profilesData.reduce((acc: Record<string, string>, profile) => {
                acc[profile.id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown';
                return acc;
              }, {});
            }
          }
          
          return supabasePrescriptions.map(p => ({
            id: p.id,
            patientName: p.patient_id && patientNames[p.patient_id] 
              ? patientNames[p.patient_id] 
              : 'Unknown Patient',
            diagnosis: p.diagnosis,
            date: new Date(p.date || Date.now()).toLocaleDateString(),
            medicines: p.medicines,
            instructions: p.instructions,
          }));
        }
        
        // If no data in Supabase, try API
        try {
          const response = await prescriptionsAPI.getDoctorPrescriptions(doctorId);
          return response.data || [];
        } catch (apiError) {
          console.error('API error fetching prescriptions:', apiError);
          // Return mock data as last resort
          return [
            {
              id: '1',
              patientName: 'John Doe',
              diagnosis: 'Common Cold',
              date: '2025-05-15',
              medicines: [
                { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours', duration: '5 days' }
              ],
              instructions: 'Plenty of rest and fluids'
            },
            {
              id: '2',
              patientName: 'Jane Smith',
              diagnosis: 'Allergic Rhinitis',
              date: '2025-05-12',
              medicines: [
                { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' }
              ],
              instructions: 'Avoid allergens if possible'
            }
          ];
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return [];
      }
    },
    enabled: !!doctorId,
  });

  const handleAddMedicine = () => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const handleRemoveMedicine = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setNewPrescription(prev => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };
      return {
        ...prev,
        medicines: updatedMedicines
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorId || !newPrescription.patientId) {
      toast.error('Missing required information');
      return;
    }

    try {
      // Format data for prescription
      const prescriptionData = {
        patient_id: newPrescription.patientId,
        doctor_id: doctorId,
        diagnosis: newPrescription.diagnosis,
        medicines: newPrescription.medicines,
        instructions: newPrescription.instructions,
        date: new Date().toISOString(),
        appointment_id: null
      };
      
      // Try Supabase insert
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescriptionData]);

      if (error) {
        console.error("Supabase error:", error);
        // If Supabase error, try API
        await prescriptionsAPI.createPrescription({
          patientId: newPrescription.patientId,
          doctorId,
          diagnosis: newPrescription.diagnosis,
          medicines: newPrescription.medicines,
          instructions: newPrescription.instructions,
          followupDate: newPrescription.followupDate,
          doctorSignature: doctorSignature,
        });
      }

      toast.success('Prescription created successfully!');
      setIsCreatingPrescription(false);
      setNewPrescription({
        patientId: '',
        diagnosis: '',
        instructions: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      });
      refetch();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription. Please try again.');
    }
  };

  const viewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetails(true);
  };

  const filteredPrescriptions = prescriptions?.filter(prescription => 
    prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading prescriptions...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prescriptions</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreatingPrescription} onOpenChange={setIsCreatingPrescription}>
            <DialogTrigger asChild>
              <Button>
                <ClipboardEdit className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePrescription} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto px-1">
                <div className="space-y-2">
                  <label htmlFor="patientId" className="text-sm font-medium">Patient</label>
                  <select
                    id="patientId"
                    name="patientId"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    value={newPrescription.patientId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a patient</option>
                    {patients?.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis</label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    required
                    value={newPrescription.diagnosis}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Medicines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Medicines</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddMedicine}
                    >
                      Add Medicine
                    </Button>
                  </div>
                  
                  {newPrescription.medicines.map((medicine, index) => (
                    <div key={index} className="p-4 border rounded-md space-y-4 relative">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => handleRemoveMedicine(index)}
                        disabled={newPrescription.medicines.length <= 1}
                      >
                        ✕
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={medicine.name}
                            onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dosage</label>
                          <Input
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Frequency</label>
                          <Input
                            value={medicine.frequency}
                            onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Duration</label>
                          <Input
                            value={medicine.duration}
                            onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="instructions" className="text-sm font-medium">Instructions</label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    value={newPrescription.instructions}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label htmlFor="followupDate" className="text-sm font-medium">Follow-up Date (optional)</label>
                  <Input
                    id="followupDate"
                    name="followupDate"
                    type="date"
                    value={newPrescription.followupDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                {!doctorSignature && (
                  <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 text-sm">
                    <p className="font-medium">Warning: No signature available</p>
                    <p>Please upload your signature in the profile section before creating prescriptions.</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingPrescription(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!doctorSignature}>
                    Create Prescription
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPrescriptions?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.date}</TableCell>
                  <TableCell className="font-medium">{prescription.patientName}</TableCell>
                  <TableCell>{prescription.diagnosis}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewPrescription(prescription)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No prescriptions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsCreatingPrescription(true)}
            >
              <ClipboardEdit className="h-4 w-4 mr-2" />
              Create Your First Prescription
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Prescription Details Dialog */}
      <Dialog open={showPrescriptionDetails} onOpenChange={setShowPrescriptionDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              Issued on {selectedPrescription?.date}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                  <p className="font-medium">{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Diagnosis</h3>
                  <p className="font-medium">{selectedPrescription.diagnosis}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Medicines</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPrescription.medicines?.map((medicine: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-4">{medicine.name}</td>
                          <td className="px-4 py-4">{medicine.dosage}</td>
                          <td className="px-4 py-4">{medicine.frequency}</td>
                          <td className="px-4 py-4">{medicine.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {selectedPrescription.instructions && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Instructions</h3>
                  <p className="text-sm">{selectedPrescription.instructions}</p>
                </div>
              )}
              
              {doctorSignature && (
                <div className="pt-4">
                  <div className="border-t pt-4">
                    <div className="flex flex-col items-end">
                      <img 
                        src={doctorSignature} 
                        alt="Doctor's signature" 
                        className="h-16 mb-1" 
                      />
                      <p className="text-sm font-medium">Doctor's Signature</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPrescriptionDetails(false)}>Close</Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DoctorPrescriptions;
