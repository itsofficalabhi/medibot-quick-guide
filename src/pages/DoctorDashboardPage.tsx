
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, DollarSign, Video, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'earnings' | 'settings'>('appointments');

  // Mock data for appointments
  const upcomingAppointments = [
    {
      id: 1,
      patientName: 'John Smith',
      appointmentType: 'Video Consultation',
      date: '2025-05-10',
      time: '10:30 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      patientName: 'Jane Doe',
      appointmentType: 'Video Consultation',
      date: '2025-05-15',
      time: '2:00 PM',
      status: 'pending'
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      patientName: 'Robert Johnson',
      appointmentType: 'Chat Consultation',
      date: '2025-04-20',
      time: '11:00 AM',
      status: 'completed'
    },
    {
      id: 4,
      patientName: 'Maria Garcia',
      appointmentType: 'Video Consultation',
      date: '2025-04-15',
      time: '3:30 PM',
      status: 'completed'
    }
  ];

  // Mock data for patients
  const patients = [
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      lastVisit: '2025-05-01',
      condition: 'Hypertension'
    },
    {
      id: 2,
      name: 'Jane Doe',
      age: 32,
      lastVisit: '2025-04-28',
      condition: 'Diabetes'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      age: 57,
      lastVisit: '2025-04-15',
      condition: 'Arthritis'
    }
  ];

  const renderAppointmentContent = () => {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="text-sm text-muted-foreground mb-1">
                          {appointment.date} at {appointment.time}
                        </div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.appointmentType === 'Video Consultation' ? (
                              <Video className="h-4 w-4 text-primary mr-1" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{appointment.appointmentType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between md:justify-end">
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
                        <Button size="sm" className="ml-4" onClick={() => initiateZoomCall(appointment.id)}>Start Call</Button>
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
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
          {pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="text-sm text-muted-foreground mb-1">
                          {appointment.date} at {appointment.time}
                        </div>
                        <h4 className="font-medium">{appointment.patientName}</h4>
                      </div>
                      <div className="p-4 md:border-r flex items-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Appointment Type</div>
                          <div className="flex items-center">
                            {appointment.appointmentType === 'Video Consultation' ? (
                              <Video className="h-4 w-4 text-primary mr-1" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{appointment.appointmentType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between md:justify-end">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="capitalize">Completed</span>
                        </div>
                        <Button size="sm" variant="outline" className="ml-4">View Notes</Button>
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
        </div>
      </div>
    );
  };

  const renderPatientsContent = () => {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Your Patients</CardTitle>
            <CardDescription>Manage your patient list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Age</th>
                    <th className="text-left py-3 px-4">Last Visit</th>
                    <th className="text-left py-3 px-4">Condition</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b">
                      <td className="py-3 px-4">{patient.name}</td>
                      <td className="py-3 px-4">{patient.age}</td>
                      <td className="py-3 px-4">{patient.lastVisit}</td>
                      <td className="py-3 px-4">{patient.condition}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View Records</Button>
                          <Button size="sm">Message</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEarningsContent = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your earnings for the current month</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">$3,450</div>
            <p className="text-sm text-muted-foreground mt-1">From 23 consultations</p>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Target</span>
                <span className="text-sm font-medium">$5,000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '69%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">69% of monthly target reached</p>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointmentContent();
      case 'patients':
        return renderPatientsContent();
      case 'earnings':
        return renderEarningsContent();
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                </div>
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
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
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
