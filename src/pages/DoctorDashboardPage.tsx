import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, User, FileText, Settings, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import PrescriptionForm from '../components/PrescriptionForm';
import PrescriptionsList from '../components/PrescriptionsList';
import { format } from 'date-fns';

const DoctorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'prescriptions' | 'settings'>('appointments');
  const [doctorData, setDoctorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data
  const todayAppointments = [
    {
      id: '1',
      patientName: 'John Smith',
      patientId: 'pat1',
      appointmentType: 'Video Consultation',
      time: '10:30 AM',
      status: 'confirmed'
    },
    {
      id: '2',
      patientName: 'Sarah Wilson',
      patientId: 'pat2',
      appointmentType: 'Video Consultation',
      time: '2:00 PM',
      status: 'pending'
    }
  ];
  
  const upcomingAppointments = [
    {
      id: '3',
      patientName: 'Michael Brown',
      patientId: 'pat3',
      appointmentType: 'Chat Consultation',
      date: '2025-05-15',
      time: '11:00 AM',
      status: 'confirmed'
    },
    {
      id: '4',
      patientName: 'Emma Davis',
      patientId: 'pat4',
      appointmentType: 'Video Consultation',
      date: '2025-05-16',
      time: '3:30 PM',
      status: 'pending'
    }
  ];
  
  const patients = [
    {
      id: 'pat1',
      name: 'John Smith',
      age: 42,
      lastVisit: '2025-05-01',
      conditions: ['Hypertension', 'Diabetes']
    },
    {
      id: 'pat2',
      name: 'Sarah Wilson',
      age: 35,
      lastVisit: '2025-04-28',
      conditions: ['Asthma']
    },
    {
      id: 'pat3',
      name: 'Michael Brown',
      age: 50,
      lastVisit: '2025-04-15',
      conditions: ['Arthritis', 'High Cholesterol']
    },
    {
      id: 'pat4',
      name: 'Emma Davis',
      age: 29,
      lastVisit: '2025-04-10',
      conditions: ['Migraine']
    }
  ];
  
  useEffect(() => {
    // Simulate loading doctor data
    const loadDoctorData = () => {
      setIsLoading(true);
      
      // Return mock data since we're having issues with the API
      setTimeout(() => {
        const mockDoctorData = {
          id: user?.id || 'doc1',
          name: user?.name || 'Dr. Jane Smith',
          specialty: 'Cardiology',
          experience: 10,
          consultationFee: 100,
          ratings: 4.8,
          reviewCount: 124
        };
        
        setDoctorData(mockDoctorData);
        setIsLoading(false);
      }, 800);
    };

    loadDoctorData();
  }, [user]);

  // Handle appointment actions
  const handleAppointmentAction = (action: string, appointmentId: string) => {
    toast.success(`Action successful`, {
      description: `${action} appointment #${appointmentId}`
    });
  };

  // Handle add new patient
  const handleAddPatient = () => {
    toast.info(`Feature coming soon`, {
      description: "Add patient functionality will be available soon."
    });
  };

  const renderAppointmentContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayAppointments.length}</div>
              <p className="text-muted-foreground text-sm">
                {format(new Date(), "MMMM d, yyyy")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-muted-foreground text-sm">Next 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{patients.length}</div>
              <p className="text-muted-foreground text-sm">Active patients</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(), "MMM d, yyyy")} at {appointment.time}
                        </div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                        <div className="text-sm text-primary">Patient ID: {appointment.patientId}</div>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.appointmentType === 'Video Consultation' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{appointment.appointmentType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-500' 
                              : appointment.status === 'pending' 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                          }`}></span>
                          <span className="capitalize">{appointment.status}</span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between md:justify-end">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAppointmentAction('Start', appointment.id)}
                          >
                            Start
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAppointmentAction('View', appointment.id)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">No appointments today</h4>
              <p className="text-sm text-muted-foreground">You don't have any scheduled appointments for today.</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(appointment.date), "MMM d, yyyy")} at {appointment.time}
                        </div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                        <div className="text-sm text-primary">Patient ID: {appointment.patientId}</div>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.appointmentType === 'Video Consultation' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{appointment.appointmentType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-500' 
                              : appointment.status === 'pending' 
                              ? 'bg-yellow-500' 
                              : 'bg-blue-500'
                          }`}></span>
                          <span className="capitalize">{appointment.status}</span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between md:justify-end">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAppointmentAction('Reschedule', appointment.id)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleAppointmentAction('Cancel', appointment.id)}
                          >
                            Cancel
                          </Button>
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
              <h4 className="font-medium">No upcoming appointments</h4>
              <p className="text-sm text-muted-foreground">Your future appointments will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPatientsContent = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Your Patients</h3>
          <Button onClick={handleAddPatient}>Add New Patient</Button>
        </div>
        
        {patients.length > 0 ? (
          <div className="space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 md:border-r">
                      <h4 className="font-medium">{patient.name}</h4>
                      <div className="text-sm text-primary">Patient ID: {patient.id}</div>
                      <div className="text-sm text-muted-foreground">Age: {patient.age}</div>
                    </div>
                    <div className="p-4 md:border-r">
                      <div className="text-sm text-muted-foreground mb-1">Medical Conditions</div>
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.map((condition, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block bg-muted rounded-full px-2 py-0.5 text-xs"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 md:border-r">
                      <div className="text-sm text-muted-foreground mb-1">Last Visit</div>
                      <div>{format(new Date(patient.lastVisit), "MMMM d, yyyy")}</div>
                    </div>
                    <div className="p-4 flex items-center justify-between md:justify-end">
                      <div className="flex space-x-2">
                        <Link to={`/chat?patientId=${patient.id}`}>
                          <Button size="sm">Start Chat</Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.info("Feature coming soon", {
                            description: "View patient record functionality will be available soon."
                          })}
                        >
                          View Record
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <h4 className="font-medium mb-1">No patients yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Start by adding patients to your practice.</p>
            <Button onClick={handleAddPatient}>Add New Patient</Button>
          </div>
        )}
      </div>
    );
  };

  const renderPrescriptionsContent = () => {
    if (!user) return null;
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Create New Prescription</h3>
          <PrescriptionForm 
            doctorId={user.id} 
            onComplete={() => {
              toast.success("Prescription Created", {
                description: "The prescription has been created successfully."
              });
            }} 
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Prescriptions</h3>
          <PrescriptionsList userId={user.id} userRole="doctor" />
        </div>
      </div>
    );
  };

  const renderSettingsContent = () => {
    if (!doctorData) return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Profile</CardTitle>
            <CardDescription>Update your professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialty" className="text-sm font-medium block mb-1">
                    Specialty
                  </label>
                  <input 
                    type="text" 
                    id="specialty" 
                    defaultValue={doctorData.specialty} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="text-sm font-medium block mb-1">
                    Years of Experience
                  </label>
                  <input 
                    type="number" 
                    id="experience" 
                    defaultValue={doctorData.experience} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="consultationFee" className="text-sm font-medium block mb-1">
                    Consultation Fee ($)
                  </label>
                  <input 
                    type="number" 
                    id="consultationFee" 
                    defaultValue={doctorData.consultationFee} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="text-sm font-medium block mb-1">
                  Professional Bio
                </label>
                <textarea 
                  id="bio" 
                  rows={4} 
                  defaultValue="Board-certified specialist with expertise in minimally invasive procedures and preventive care."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                ></textarea>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">
                  Working Hours
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="text-xs text-muted-foreground block mb-1">
                      Start Time
                    </label>
                    <input 
                      type="time" 
                      id="startTime" 
                      defaultValue="09:00" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="text-xs text-muted-foreground block mb-1">
                      End Time
                    </label>
                    <input 
                      type="time" 
                      id="endTime" 
                      defaultValue="17:00" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={() => toast.success("Profile Updated", {
                  description: "Your doctor profile has been updated successfully."
                })}
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Notification Preferences</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Email Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Receive emails about new appointments and patient messages
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">SMS Notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Receive text message alerts for urgent matters
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => toast.info("Feature coming soon", {
                description: "Change password functionality will be available soon."
              })}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointmentContent();
      case 'patients':
        return renderPatientsContent();
      case 'prescriptions':
        return renderPrescriptionsContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderAppointmentContent();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {doctorData?.name?.charAt(0) || user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h2 className="font-semibold">{doctorData?.name || user?.name || 'Doctor'}</h2>
                  <p className="text-xs text-muted-foreground">{doctorData?.specialty || 'Loading...'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'appointments'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Appointments
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'patients'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('patients')}
                >
                  <User className="h-4 w-4" />
                  Patients
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'prescriptions'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('prescriptions')}
                >
                  <FileText className="h-4 w-4" />
                  Prescriptions
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'settings'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </nav>
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full" onClick={() => logout()}>
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
              {activeTab === 'prescriptions' && 'Prescriptions'}
              {activeTab === 'settings' && 'Doctor Settings'}
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
