
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, DollarSign, Video, Clock, CheckCircle, FileText, BarChart, MessageSquare, BellIcon, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrescriptionForm from '@/components/PrescriptionForm';
import PrescriptionsList from '@/components/PrescriptionsList';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DoctorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'earnings' | 'prescriptions' | 'analytics' | 'messages' | 'settings'>('appointments');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{id: string; name: string; appointmentId: number} | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorDetails, setDoctorDetails] = useState<any>(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!user) return;
      
      try {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (doctorError) throw doctorError;
        
        if (doctorData) {
          setDoctorDetails(doctorData);
          
          // Now fetch appointments for this doctor
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('appointments')
            .select(`
              *,
              profiles:patient_id (
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('doctor_id', doctorData.id)
            .order('date', { ascending: true });
          
          if (appointmentsError) throw appointmentsError;
          
          setAppointments(appointmentsData || []);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        toast({
          title: "Error",
          description: "Could not fetch your doctor information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [user]);

  const upcomingAppointments = appointments.filter(
    app => new Date(`${app.date}T${app.time}`) >= new Date() && app.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(
    app => new Date(`${app.date}T${app.time}`) < new Date() || app.status === 'cancelled'
  );

  // Mock data for patients
  const patients = [
    {
      id: 'user1',
      name: 'John Smith',
      age: 45,
      lastVisit: '2025-05-01',
      condition: 'Hypertension',
      avatar: '/placeholder.svg'
    },
    {
      id: 'user2',
      name: 'Jane Doe',
      age: 32,
      lastVisit: '2025-04-28',
      condition: 'Diabetes',
      avatar: '/placeholder.svg'
    },
    {
      id: 'user3',
      name: 'Robert Johnson',
      age: 57,
      lastVisit: '2025-04-15',
      condition: 'Arthritis',
      avatar: '/placeholder.svg'
    },
    {
      id: 'user4',
      name: 'Maria Garcia',
      age: 29,
      lastVisit: '2025-04-10',
      condition: 'Migraine',
      avatar: '/placeholder.svg'
    },
    {
      id: 'user5',
      name: 'David Miller',
      age: 41,
      lastVisit: '2025-04-05',
      condition: 'Asthma',
      avatar: '/placeholder.svg'
    }
  ].concat(
    appointments
      .filter(app => app.profiles)
      .map(app => ({
        id: app.patient_id,
        name: `${app.profiles.first_name} ${app.profiles.last_name}`,
        lastVisit: app.date,
        avatar: app.profiles.avatar_url || '/placeholder.svg',
        age: 35, // Placeholder age
        condition: 'Consultation'
      }))
  ).filter((patient, index, self) => 
    index === self.findIndex(p => p.id === patient.id)
  );

  const handleWritePrescription = (patient: {id: string; name: string}, appointmentId: number) => {
    setSelectedPatient({
      id: patient.id,
      name: patient.name,
      appointmentId
    });
    setShowPrescriptionForm(true);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // Update local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status } : app
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Appointment ${status} successfully`
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Could not update appointment status",
        variant: "destructive"
      });
    }
  };

  const renderAppointmentContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(app => app.date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active patients under your care</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.length ? 
                  Math.round((appointments.filter(app => app.status === 'completed').length / appointments.length) * 100) : 
                  0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Appointment completion rate</p>
            </CardContent>
          </Card>
        </div>
      
        <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="pt-4">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="p-4 md:border-r">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={appointment.profiles?.avatar_url || '/placeholder.svg'} />
                              <AvatarFallback>
                                {appointment.profiles ? 
                                  `${appointment.profiles.first_name?.[0]}${appointment.profiles.last_name?.[0]}` : 
                                  'PT'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {appointment.profiles ? 
                                  `${appointment.profiles.first_name} ${appointment.profiles.last_name}` : 
                                  'Patient'}
                              </h4>
                              <div className="text-sm text-muted-foreground">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:border-r">
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.type === 'video' ? (
                              <Video className="h-4 w-4 text-primary mr-1" />
                            ) : appointment.type === 'phone' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            ) : (
                              <MessageSquare className="h-4 w-4 text-primary mr-1" />
                            )}
                            <span className="capitalize">{appointment.type} Consultation</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Fee:</span> ${appointment.amount}
                          </div>
                        </div>
                        <div className="p-4 md:border-r">
                          <div className="text-sm text-muted-foreground mb-1">Status</div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              appointment.status === 'scheduled' 
                                ? 'bg-green-500' 
                                : appointment.status === 'pending' 
                                ? 'bg-yellow-500' 
                                : 'bg-blue-500'
                            }`}></span>
                            <span className="capitalize">{appointment.status}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Payment:</span> 
                            <span className={appointment.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}>
                              {' '}{appointment.payment_status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between md:justify-end">
                          <div className="flex space-x-2">
                            {appointment.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                onClick={() => window.open(`/video-call?appointmentId=${appointment.id}`, '_blank')}
                              >
                                Start Call
                              </Button>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cancel this appointment</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/50 rounded-lg">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h4 className="font-medium mb-1">No upcoming appointments</h4>
                <p className="text-sm text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="pt-4">
            {pastAppointments.length > 0 ? (
              <div className="space-y-3">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="p-4 md:border-r">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={appointment.profiles?.avatar_url || '/placeholder.svg'} />
                              <AvatarFallback>
                                {appointment.profiles ? 
                                  `${appointment.profiles.first_name?.[0]}${appointment.profiles.last_name?.[0]}` : 
                                  'PT'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {appointment.profiles ? 
                                  `${appointment.profiles.first_name} ${appointment.profiles.last_name}` : 
                                  'Patient'}
                              </h4>
                              <div className="text-sm text-muted-foreground">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:border-r">
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.type === 'video' ? (
                              <Video className="h-4 w-4 text-primary mr-1" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-primary mr-1" />
                            )}
                            <span className="capitalize">{appointment.type} Consultation</span>
                          </div>
                        </div>
                        <div className="p-4 md:border-r">
                          <div className="text-sm text-muted-foreground mb-1">Status</div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              appointment.status === 'completed' 
                                ? 'bg-green-500' 
                                : appointment.status === 'cancelled' 
                                ? 'bg-red-500' 
                                : 'bg-blue-500'
                            }`}></span>
                            <span className="capitalize">{appointment.status}</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-wrap items-center justify-between md:justify-end">
                          <div className="flex space-x-2">
                            {appointment.status === 'completed' ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleWritePrescription({
                                    id: appointment.patient_id, 
                                    name: appointment.profiles ? 
                                      `${appointment.profiles.first_name} ${appointment.profiles.last_name}` : 
                                      'Patient'
                                  }, parseInt(appointment.id))}
                                >
                                  Write Prescription
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={() => console.log('View session notes for', appointment.id)}
                                      >
                                        Notes
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View consultation notes</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            ) : appointment.status === 'scheduled' && (
                              <>
                                <Button 
                                  size="sm"
                                  variant="secondary" 
                                  onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                >
                                  Mark Completed
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/50 rounded-lg">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h4 className="font-medium">No past appointments</h4>
                <p className="text-sm text-muted-foreground">Your appointment history will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderPatientsContent = () => {
    return (
      <div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Patients</CardTitle>
                <CardDescription>Manage your patient list</CardDescription>
              </div>
              <Button size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Add Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Patient</th>
                    <th className="text-left py-3 px-4">Age</th>
                    <th className="text-left py-3 px-4">Last Visit</th>
                    <th className="text-left py-3 px-4">Condition</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={patient.avatar || '/placeholder.svg'} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{patient.age}</td>
                      <td className="py-3 px-4">{patient.lastVisit}</td>
                      <td className="py-3 px-4">{patient.condition}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleWritePrescription({id: patient.id, name: patient.name}, 0)}
                          >
                            Prescribe
                          </Button>
                          <Button size="sm" variant="secondary">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Records</CardTitle>
              <CardDescription>View and manage patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.slice(0, 3).map((patient) => (
                  <div key={`record-${patient.id}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={patient.avatar} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">{patient.condition}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View Records</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderAnalyticsContent = () => {
    // Mock data for analytics
    const patientsByMonth = [
      { month: 'Jan', patients: 15 },
      { month: 'Feb', patients: 22 },
      { month: 'Mar', patients: 18 },
      { month: 'Apr', patients: 25 },
      { month: 'May', patients: 30 },
    ];

    const satisfactionRatings = [
      { rating: '5★', percentage: 65 },
      { rating: '4★', percentage: 25 },
      { rating: '3★', percentage: 7 },
      { rating: '2★', percentage: 2 },
      { rating: '1★', percentage: 1 },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Appointments Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(app => app.status === 'completed').length}
              </div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                <span>8% increase this month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                4.5
                <span className="text-yellow-500 ml-2 text-lg">★★★★½</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on {appointments.length * 0.8} patient reviews
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${appointments.filter(app => app.payment_status === 'paid').reduce((sum, app) => sum + parseFloat(app.amount), 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500 mr-1">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
                <span>12% increase this month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Growth</CardTitle>
              <CardDescription>New patients over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end space-x-2">
                {patientsByMonth.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/90 rounded-t-md" 
                      style={{ height: `${(data.patients / 30) * 180}px` }}
                    ></div>
                    <div className="mt-2 text-xs">{data.month}</div>
                    <div className="text-xs text-muted-foreground">{data.patients}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Patient Satisfaction</CardTitle>
              <CardDescription>Rating distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {satisfactionRatings.map((data) => (
                  <div key={data.rating} className="flex items-center">
                    <div className="w-12 text-sm">{data.rating}</div>
                    <div className="flex-1 mx-2">
                      <div className="h-2 rounded-full bg-secondary">
                        <div 
                          className="h-2 rounded-full bg-primary" 
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm text-right">{data.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Appointment distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text-lg font-semibold">
                  {appointments.filter(app => app.type === 'video').length} Video Consultations
                </h4>
                <div className="h-2 w-96 bg-secondary rounded-full">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">65% of total appointments</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-semibold">
                  {appointments.filter(app => app.type === 'chat').length} Chat Consultations
                </h4>
                <div className="h-2 w-96 bg-secondary rounded-full">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '25%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">25% of total appointments</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-semibold">
                  {appointments.filter(app => app.type === 'phone').length} Phone Consultations
                </h4>
                <div className="h-2 w-96 bg-secondary rounded-full">
                  <div className="h-2 rounded-full bg-purple-500" style={{ width: '10%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">10% of total appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMessagesContent = () => {
    // Mock data for messages
    const messages = [
      {
        id: 1,
        sender: 'John Smith',
        avatar: '/placeholder.svg',
        message: 'Hello Dr. Johnson, I have a question about my prescription.',
        time: '10:30 AM',
        unread: true
      },
      {
        id: 2,
        sender: 'Jane Doe',
        avatar: '/placeholder.svg',
        message: 'Thank you for the consultation yesterday. I feel much better today.',
        time: 'Yesterday',
        unread: false
      },
      {
        id: 3,
        sender: 'Robert Johnson',
        avatar: '/placeholder.svg',
        message: 'When can I schedule my follow-up appointment?',
        time: 'Yesterday',
        unread: false
      },
      {
        id: 4,
        sender: 'Maria Garcia',
        avatar: '/placeholder.svg',
        message: 'I need to reschedule my appointment for next week.',
        time: '2 days ago',
        unread: false
      }
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Patient Messages</CardTitle>
              <Button size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                New Message
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-4 border rounded-lg ${msg.unread ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{msg.sender}</h4>
                          {msg.unread && (
                            <span className="inline-block bg-primary text-white text-xs px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.time}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Reply</Button>
                  </div>
                  <p className="mt-2">{msg.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>Quick responses for common inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Appointment Reminder</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This is a reminder about your appointment scheduled for [DATE] at [TIME]. Please arrive 15 minutes early.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Prescription Ready</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your prescription is ready. You can pick it up at your local pharmacy or view it in your patient portal.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Follow-up Instructions</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Thank you for your visit. Please follow these instructions: [INSTRUCTIONS]. Contact me if symptoms persist.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">Use Template</Button>
                </div>
              </div>
              
              <Button className="w-full">Create New Template</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Calculate earnings based on mock data
  const calculateEarnings = () => {
    return appointments.filter(app => app.payment_status === 'paid').reduce((sum, app) => sum + parseFloat(app.amount), 0);
  };

  const totalEarnings = calculateEarnings();

  const renderEarningsContent = () => {
    // Monthly data for the graph
    const monthlyData = [
      { month: 'Jan', earnings: 2800 },
      { month: 'Feb', earnings: 3200 },
      { month: 'Mar', earnings: 2900 },
      { month: 'Apr', earnings: 3450 },
      { month: 'May', earnings: totalEarnings || 0 }, // Current month
      { month: 'Jun', earnings: 0 }, // Future month
    ];

    // Recent payments data
    const recentPayments = appointments
      .filter(app => app.payment_status === 'paid')
      .map(app => ({
        id: app.id,
        patient: app.profiles ? `${app.profiles.first_name} ${app.profiles.last_name}` : 'Patient',
        amount: parseFloat(app.amount),
        date: app.date,
        type: `${app.type.charAt(0).toUpperCase() + app.type.slice(1)} Consultation`
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,087</div>
              <p className="text-xs text-muted-foreground">Last 4 months</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">Total consultations</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your earnings by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end space-x-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-primary/90 rounded-t-md" 
                    style={{ 
                      height: data.earnings > 0 ? `${(data.earnings / 4000) * 180}px` : '0px',
                      minHeight: data.earnings > 0 ? '20px' : '0px'
                    }}
                  ></div>
                  <div className="mt-2 text-xs">{data.month}</div>
                  <div className="text-xs text-muted-foreground">
                    {data.earnings > 0 ? `$${data.earnings}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{payment.patient}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        {payment.type} · {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-lg font-semibold">${payment.amount.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-muted/50 rounded-lg">
                  <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h4 className="font-medium">No payments yet</h4>
                  <p className="text-sm text-muted-foreground">Your payment history will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Your payment methods and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">****6789</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Digital Wallet</div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              
              <Button className="w-full mt-2">Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPrescriptionsContent = () => {
    if (!user) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Prescriptions History</h3>
          <Button onClick={() => setShowPrescriptionForm(true)}>Create New Prescription</Button>
        </div>
        
        {showPrescriptionForm && selectedPatient ? (
          <PrescriptionForm
            patientName={selectedPatient.name}
            patientId={selectedPatient.id}
            appointmentId={selectedPatient.appointmentId}
            onComplete={() => {
              setShowPrescriptionForm(false);
              setSelectedPatient(null);
              toast({
                title: "Prescription Created",
                description: "Prescription has been created successfully.",
              });
            }}
          />
        ) : showPrescriptionForm ? (
          <PrescriptionForm
            patientName="New Patient"
            patientId="new"
            appointmentId={0}
            onComplete={() => {
              setShowPrescriptionForm(false);
              toast({
                title: "Prescription Created",
                description: "Prescription has been created successfully.",
              });
            }}
          />
        ) : (
          <PrescriptionsList userId={user.id} userRole="doctor" />
        )}
      </div>
    );
  };

  const renderSettingsContent = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Practice Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Specialty</label>
                <input 
                  type="text"
                  defaultValue={doctorDetails?.specialty || "General Medicine"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Years of Experience</label>
                <input 
                  type="number"
                  defaultValue={doctorDetails?.experience || 5}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Consultation Fee</label>
                <input 
                  type="text"
                  defaultValue={doctorDetails?.consultation_fee || "100.00"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Phone</label>
                <input 
                  type="tel"
                  defaultValue={doctorDetails?.phone || "+1 (555) 123-4567"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Notification Preferences</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive emails about appointments and updates
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">SMS Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive text messages for appointment reminders
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Browser Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Receive notifications when patients message you
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Availability Settings</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center">
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <Button
                    variant={day === 'Sat' || day === 'Sun' ? 'outline' : 'default'}
                    size="sm"
                    className="w-full"
                  >
                    {day === 'Sat' || day === 'Sun' ? 'Off' : 'On'}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline">Configure Working Hours</Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3">Password</h3>
            <Button variant="outline">Change Password</Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-3 text-destructive">Danger Zone</h3>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointmentContent();
      case 'patients':
        return renderPatientsContent();
      case 'earnings':
        return renderEarningsContent();
      case 'prescriptions':
        return renderPrescriptionsContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'messages':
        return renderMessagesContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderAppointmentContent();
    }
  };

  // Function to initiate a Zoom call
  const initiateZoomCall = (appointmentId: number) => {
    console.log(`Initiating Zoom call for appointment ${appointmentId}`);
    // This would normally call the Zoom API to start a meeting
    window.open('/video-call?appointmentId=' + appointmentId, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <Card className="sticky top-24 bg-[#1A1F2C] text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-medium">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h2 className="font-semibold">{user?.name || 'Doctor'}</h2>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'appointments'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar className="h-4 w-4" />
                  Appointments
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'patients'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('patients')}
                >
                  <User className="h-4 w-4" />
                  Patients
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'prescriptions'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('prescriptions')}
                >
                  <FileText className="h-4 w-4" />
                  Prescriptions
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'analytics'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart className="h-4 w-4" />
                  Analytics
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'messages'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('messages')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'earnings'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('earnings')}
                >
                  <DollarSign className="h-4 w-4" />
                  Earnings
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'settings'
                      ? 'bg-[#8B5CF6] text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </nav>
              
              <Separator className="my-4 bg-white/20" />
              
              <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10" onClick={() => logout()}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === 'appointments' && 'Appointments'}
              {activeTab === 'patients' && 'Patient Management'}
              {activeTab === 'prescriptions' && 'Prescriptions Management'}
              {activeTab === 'analytics' && 'Practice Analytics'}
              {activeTab === 'messages' && 'Patient Messages'}
              {activeTab === 'earnings' && 'Earnings & Payments'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
