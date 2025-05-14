import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface PrescriptionFormProps {
  onComplete: () => void;
  patientName?: string;
  patientId?: string;
  appointmentId?: number;
  doctorId?: string;
}

interface FormValues {
  patientName: string;
  patientId: string;
  diagnosis: string;
  instructions: string;
  followupDate?: Date;
  appointmentId?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  patientName = '', 
  patientId = '', 
  appointmentId,
  doctorId = '',
  onComplete 
}) => {
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>(
    appointmentId ? String(appointmentId) : undefined
  );
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    defaultValues: {
      patientName,
      patientId,
      diagnosis: '',
      instructions: '',
      appointmentId: appointmentId ? String(appointmentId) : undefined
    }
  });

  // Fetch patient's appointments with this doctor
  useEffect(() => {
    if (patientId && doctorId) {
      // In a real app, this would be an API call
      // For now we'll use mock data from localStorage
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const patientAppointments = allAppointments.filter(
        (apt: any) => apt.patientId === patientId && apt.doctorId === doctorId
      );
      setAppointments(patientAppointments);
    }
  }, [patientId, doctorId]);

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

  const handleSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Create prescription object
    const prescription = {
      patientName: values.patientName,
      patientId: values.patientId,
      appointmentId: selectedAppointmentId,
      diagnosis: values.diagnosis,
      medicines,
      instructions: values.instructions,
      followupDate: values.followupDate ? values.followupDate.toISOString() : undefined,
      date: new Date().toISOString(),
      id: `prescription-${Date.now()}`,
      doctorId
    };

    // Save to localStorage (in a real app, this would go to a database)
    const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    localStorage.setItem('prescriptions', JSON.stringify([...existingPrescriptions, prescription]));

    // Also save to patient-specific prescriptions
    const patientPrescriptions = JSON.parse(localStorage.getItem(`prescriptions_${values.patientId}`) || '[]');
    localStorage.setItem(`prescriptions_${values.patientId}`, JSON.stringify([...patientPrescriptions, prescription]));

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium block mb-1" htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  {...form.register('patientName')}
                  placeholder="Enter patient name" 
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium block mb-1" htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  {...form.register('patientId')}
                  placeholder="Enter patient ID" 
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium block mb-1">Date</Label>
                <Input value={new Date().toLocaleDateString()} disabled />
              </div>
              <div>
                <Label className="text-sm font-medium block mb-1">Appointment</Label>
                <Select 
                  value={selectedAppointmentId} 
                  onValueChange={(value) => setSelectedAppointmentId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No appointment</SelectItem>
                    {appointments.map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {format(new Date(apt.date), 'MMM d, yyyy')} at {apt.time} - {apt.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-medium block mb-1" htmlFor="diagnosis">Diagnosis</Label>
              <Textarea 
                id="diagnosis"
                {...form.register('diagnosis')}
                placeholder="Enter diagnosis details" 
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Medications</Label>
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
              <Label className="text-sm font-medium block mb-1" htmlFor="instructions">Additional Instructions</Label>
              <Textarea 
                id="instructions"
                {...form.register('instructions')}
                placeholder="Enter any additional instructions for the patient" 
              />
            </div>

            <div className="mb-4">
              <Label className="text-sm font-medium block mb-1">Follow-up Date (Optional)</Label>
              <FormField
                control={form.control}
                name="followupDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;
