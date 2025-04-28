
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, User, FileText, Settings, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'records' | 'settings'>('appointments');

  // Mock data for appointments
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'General Medicine',
      appointmentType: 'Video Consultation',
      date: '2025-05-10',
      time: '10:30 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      doctorSpecialty: 'Cardiology',
      appointmentType: 'Video Consultation',
      date: '2025-05-15',
      time: '2:00 PM',
      status: 'pending'
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      doctorName: 'Dr. Amanda Rodriguez',
      doctorSpecialty: 'Pediatrics',
      appointmentType: 'Chat Consultation',
      date: '2025-04-20',
      time: '11:00 AM',
      status: 'completed'
    },
    {
      id: 4,
      doctorName: 'Dr. James Wilson',
      doctorSpecialty: 'Dermatology',
      appointmentType: 'Video Consultation',
      date: '2025-04-15',
      time: '3:30 PM',
      status: 'completed'
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
                        <h4 className="font-medium">{appointment.doctorName}</h4>
                        <div className="text-sm text-primary">{appointment.doctorSpecialty}</div>
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
                        <Button size="sm" className="ml-4">Join</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted/50 rounded-lg">
              <CalendarIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h4 className="font-medium mb-1">No upcoming appointments</h4>
              <p className="text-sm text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
              <Link to="/doctors">
                <Button>Book an Appointment</Button>
              </Link>
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
                        <h4 className="font-medium">{appointment.doctorName}</h4>
                        <div className="text-sm text-primary">{appointment.doctorSpecialty}</div>
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
                      <div className="p-4 flex items-center justify-between md:justify-end">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="capitalize">Completed</span>
                        </div>
                        <Button size="sm" variant="outline" className="ml-4">View</Button>
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

  const renderProfileContent = () => {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium block mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="fullName" 
                    defaultValue={user?.name} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium block mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    defaultValue={user?.email} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium block mb-1">
                    Phone
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    defaultValue="+1 (555) 123-4567" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="text-sm font-medium block mb-1">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    id="dob" 
                    defaultValue="1990-01-01" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="text-sm font-medium block mb-1">
                  Address
                </label>
                <input 
                  type="text" 
                  id="address" 
                  defaultValue="123 Medical Plaza" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="text-sm font-medium block mb-1">
                    City
                  </label>
                  <input 
                    type="text" 
                    id="city" 
                    defaultValue="San Francisco" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="text-sm font-medium block mb-1">
                    State
                  </label>
                  <input 
                    type="text" 
                    id="state" 
                    defaultValue="CA" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="text-sm font-medium block mb-1">
                    ZIP Code
                  </label>
                  <input 
                    type="text" 
                    id="zipCode" 
                    defaultValue="94103" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <Button type="button">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return renderAppointmentContent();
      case 'profile':
        return renderProfileContent();
      case 'records':
        return (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">Medical Records</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Your medical records will be available here after consultations with our doctors.
            </p>
          </div>
        );
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
                        Receive emails about your appointments and health updates
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-semibold">{user?.name || 'User'}</h2>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
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
                    activeTab === 'profile'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    activeTab === 'records'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => setActiveTab('records')}
                >
                  <FileText className="h-4 w-4" />
                  Medical Records
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
              {activeTab === 'appointments' && 'Your Appointments'}
              {activeTab === 'profile' && 'Personal Profile'}
              {activeTab === 'records' && 'Medical Records'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
