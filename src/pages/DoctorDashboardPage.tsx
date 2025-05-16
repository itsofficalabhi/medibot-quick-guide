
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DoctorSignatureUpload from '@/components/DoctorSignatureUpload';
import { supabase } from "@/integrations/supabase/client";
import { doctorsAPI, prescriptionsAPI } from '@/services/api';
import DoctorPatients from '@/components/DoctorPatients';
import DoctorPrescriptions from '@/components/DoctorPrescriptions';
import DoctorBilling from '@/components/DoctorBilling';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from "lucide-react";

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorSignature, setDoctorSignature] = useState<string | undefined>(undefined);
  const [doctorData, setDoctorData] = useState(null);

  const { data: doctorProfile, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['doctorProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        // Try to get doctor data from Supabase first
        const { data: supabaseData, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (supabaseData) {
          return supabaseData;
        }
        
        // If not found in Supabase, try MongoDB through our API
        const response = await doctorsAPI.getDoctorById(user.id);
        return response.data;
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ['doctorPrescriptions', doctorProfile?.id],
    queryFn: async () => {
      if (!doctorProfile?.id) return [];
      
      try {
        // Try Supabase first
        const { data: supabasePrescriptions, error } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('doctor_id', doctorProfile.id);
        
        if (supabasePrescriptions?.length) {
          return supabasePrescriptions;
        }
        
        // If not found in Supabase, try MongoDB through API
        const response = await prescriptionsAPI.getDoctorPrescriptions(doctorProfile.id);
        return response.data;
      } catch (error) {
        console.error('Error fetching doctor prescriptions:', error);
        return [];
      }
    },
    enabled: !!doctorProfile?.id,
  });

  // Mock data for the dashboard
  const upcomingAppointments = [
    { id: 1, patient: 'John Doe', date: '2025-05-20', time: '10:00 AM', status: 'confirmed' },
    { id: 2, patient: 'Jane Smith', date: '2025-05-20', time: '11:30 AM', status: 'confirmed' },
    { id: 3, patient: 'Robert Johnson', date: '2025-05-21', time: '09:15 AM', status: 'pending' }
  ];

  const recentPrescriptions = prescriptions?.slice(0, 3) || [
    { id: 1, patient: 'John Doe', date: '2025-05-15', diagnosis: 'Common Cold' },
    { id: 2, patient: 'Alice Brown', date: '2025-05-14', diagnosis: 'Hypertension' },
    { id: 3, patient: 'Michael Wilson', date: '2025-05-13', diagnosis: 'Arthritis' }
  ];

  const handleSignatureUpdated = (signatureUrl: string) => {
    setDoctorSignature(signatureUrl);
    // In a real implementation, we would save this to the doctor's profile
    console.log("Signature updated:", signatureUrl);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p>Please log in to access the doctor dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoadingDoctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading doctor profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Dr. {user.name}</p>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">3 remaining for today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">153</div>
                <p className="text-xs text-muted-foreground">+12 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earnings this Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,385</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.date} at {appointment.time}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPrescriptions.map(prescription => (
                    <div key={prescription.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{prescription.patient}</p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.diagnosis} - {prescription.date}
                        </p>
                      </div>
                      <button className="text-primary text-sm">View</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Manage Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Appointment management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <DoctorPatients doctorId={doctorProfile?.id} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <DoctorPrescriptions 
            doctorId={doctorProfile?.id} 
            doctorSignature={doctorSignature} 
          />
        </TabsContent>

        <TabsContent value="billing">
          <DoctorBilling doctorId={doctorProfile?.id} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground">Name:</div>
                    <div className="col-span-2">{user.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground">Email:</div>
                    <div className="col-span-2">{user.email}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground">Specialty:</div>
                    <div className="col-span-2">{doctorProfile?.specialty || 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground">Experience:</div>
                    <div className="col-span-2">{doctorProfile?.experience ? `${doctorProfile.experience} years` : 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium text-muted-foreground">Languages:</div>
                    <div className="col-span-2">{doctorProfile?.languages?.join(', ') || 'Not specified'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DoctorSignatureUpload 
              doctorId={doctorProfile?.id || user.id} 
              existingSignature={doctorSignature}
              onSignatureUpdated={handleSignatureUpdated}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboardPage;
