import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
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

export interface PrescriptionFormProps {
  doctorId: string;
  onComplete?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ doctorId, onComplete }) => {
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const { toast } = useToast();

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    const newMedicines = [...medicines];
    newMedicines.splice(index, 1);
    setMedicines(newMedicines);
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setMedicines(newMedicines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !patientId || !diagnosis || medicines.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for patient info, diagnosis, and all medicines.",
        variant: "destructive"
      });
      return;
    }

    const prescription = {
      id: uuidv4(),
      patientName,
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      instructions,
      date: new Date().toISOString(),
      doctorId: doctorId,
      followupDate: followupDate,
      status: 'active'
    };

    // Save prescription to local storage
    let prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    prescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

    // Also save under patient ID
    let patientPrescriptions = JSON.parse(localStorage.getItem(`prescriptions_${patientId}`) || '[]');
    patientPrescriptions.push(prescription);
    localStorage.setItem(`prescriptions_${patientId}`, JSON.stringify(patientPrescriptions));

    setPatientName('');
    setPatientId('');
    setAppointmentId('');
    setDiagnosis('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setInstructions('');
    setFollowupDate('');

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointmentId">Appointment ID (Optional)</Label>
              <Select onValueChange={(value) => setAppointmentId(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Appointment ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="123">123</SelectItem>
                  <SelectItem value="456">456</SelectItem>
                  <SelectItem value="789">789</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="followupDate">Follow-up Date (Optional)</Label>
              <Input
                type="date"
                id="followupDate"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Medicines</Label>
            {medicines.map((medicine, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor={`medicineName-${index}`}>Name</Label>
                  <Input
                    type="text"
                    id={`medicineName-${index}`}
                    value={medicine.name}
                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`medicineDosage-${index}`}>Dosage</Label>
                  <Input
                    type="text"
                    id={`medicineDosage-${index}`}
                    value={medicine.dosage}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`medicineFrequency-${index}`}>Frequency</Label>
                  <Input
                    type="text"
                    id={`medicineFrequency-${index}`}
                    value={medicine.frequency}
                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`medicineDuration-${index}`}>Duration</Label>
                  <Input
                    type="text"
                    id={`medicineDuration-${index}`}
                    value={medicine.duration}
                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    required
                  />
                </div>
                {medicines.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeMedicine(index)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" size="sm" onClick={addMedicine}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          <div>
            <Label htmlFor="instructions">Additional Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <Button type="submit">Create Prescription</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;
