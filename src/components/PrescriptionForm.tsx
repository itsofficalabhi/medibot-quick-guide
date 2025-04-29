
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface PrescriptionFormProps {
  patientName: string;
  patientId: string;
  appointmentId: number;
  onComplete: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  patientName, 
  patientId, 
  appointmentId, 
  onComplete 
}) => {
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create prescription object
    const prescription = {
      patientName,
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      instructions,
      date: new Date().toISOString(),
      id: `prescription-${Date.now()}`
    };

    // Save to localStorage (in a real app, this would go to a database)
    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    localStorage.setItem('prescriptions', JSON.stringify([...existingPrescriptions, prescription]));

    // Also save to patient-specific prescriptions
    const patientPrescriptions = JSON.parse(localStorage.getItem(`prescriptions_${patientId}`) || '[]');
    localStorage.setItem(`prescriptions_${patientId}`, JSON.stringify([...patientPrescriptions, prescription]));

    // Show success message
    toast({
      title: "Prescription Created",
      description: "The prescription has been successfully created and shared with the patient.",
    });

    setIsSubmitting(false);
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium block mb-1">Patient Name</label>
                <Input value={patientName} disabled />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <Input value={new Date().toLocaleDateString()} disabled />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Diagnosis</label>
              <Textarea 
                value={diagnosis} 
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis details" 
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Medications</label>
                <Button type="button" size="sm" variant="outline" onClick={addMedicine}>
                  Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div key={index} className="p-3 border rounded-md mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Medicine {index + 1}</h4>
                    {medicines.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMedicine(index)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-xs block mb-1">Medicine Name</label>
                      <Input 
                        value={medicine.name} 
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        placeholder="Medicine name" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs block mb-1">Dosage</label>
                      <Input 
                        value={medicine.dosage} 
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g., 10mg" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs block mb-1">Frequency</label>
                      <Select 
                        value={medicine.frequency} 
                        onValueChange={(value) => updateMedicine(index, 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times a day">Three times a day</SelectItem>
                          <SelectItem value="Four times a day">Four times a day</SelectItem>
                          <SelectItem value="Every other day">Every other day</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs block mb-1">Duration</label>
                      <Input 
                        value={medicine.duration} 
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Additional Instructions</label>
              <Textarea 
                value={instructions} 
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter any additional instructions for the patient" 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onComplete}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Prescription'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;
