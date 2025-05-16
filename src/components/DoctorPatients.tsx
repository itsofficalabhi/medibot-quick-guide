
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsAPI } from '@/services/api';
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
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DoctorPatientsProps {
  doctorId?: string;
}

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
}

const DoctorPatients: React.FC<DoctorPatientsProps> = ({ doctorId }) => {
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatient, setNewPatient] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
  });

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['doctorPatients', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];

      try {
        // Try Supabase first
        const { data: supabasePatients, error } = await supabase
          .from('patients')
          .select(`
            id,
            profiles (id, first_name, last_name, date_of_birth, address, city)
          `)
          .eq('doctor_id', doctorId);

        if (supabasePatients?.length) {
          return supabasePatients.map((p) => ({
            id: p.id,
            name: `${p.profiles.first_name} ${p.profiles.last_name}`,
            dateOfBirth: p.profiles.date_of_birth,
            address: `${p.profiles.address}, ${p.profiles.city}`,
          }));
        }

        // If not found in Supabase, try API
        const response = await doctorsAPI.getDoctorPatients(doctorId);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching patients:', error);
        return [];
      }
    },
    enabled: !!doctorId,
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            doctor_id: doctorId,
            name: newPatient.name,
            email: newPatient.email,
            phone: newPatient.phone,
            date_of_birth: newPatient.dateOfBirth,
            address: newPatient.address,
          }
        ]);

      if (error) {
        // If Supabase error, try API
        await doctorsAPI.addPatient({
          doctorId,
          name: newPatient.name,
          email: newPatient.email,
          phone: newPatient.phone,
          dateOfBirth: newPatient.dateOfBirth,
          address: newPatient.address,
        });
      }

      toast.success('Patient added successfully!');
      setIsAddingPatient(false);
      setNewPatient({
        name: '',
        email: '',
        phone: '',
      });
      refetch();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredPatients = patients?.filter((patient) => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading patients...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Patients</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={newPatient.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={newPatient.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    value={newPatient.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input
                    id="address"
                    name="address"
                    value={newPatient.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddingPatient(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Patient
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPatients?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.dateOfBirth || 'N/A'}</TableCell>
                  <TableCell>{patient.address || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No patients found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsAddingPatient(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Patient
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorPatients;
