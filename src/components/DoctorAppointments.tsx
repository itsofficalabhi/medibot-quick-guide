
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appointmentsAPI } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  amount: number;
  meetingLink?: string;
}

interface DoctorAppointmentsProps {
  doctorId?: string;
}

const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({ doctorId }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: appointments, isLoading, error, refetch } = useQuery({
    queryKey: ['doctorAppointments', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];

      try {
        const response = await appointmentsAPI.getDoctorAppointments(doctorId);
        return response.data;
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
    enabled: !!doctorId,
  });

  const updateAppointmentStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      await appointmentsAPI.updateAppointment(id, { status });
      toast.success(`Appointment status updated to ${status}`);
      refetch();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const generateMeetingLink = async (id: string) => {
    try {
      const meetingLink = `https://meet.mediclinic.com/${id}`;
      await appointmentsAPI.updateAppointment(id, { meetingLink });
      toast.success('Meeting link generated');
      refetch();
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast.error('Failed to generate meeting link');
    }
  };

  const getAppointmentsByStatus = (status: 'upcoming' | 'past' | 'today') => {
    if (!appointments) return [];

    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = parseISO(appointment.date);
      
      if (status === 'upcoming') {
        return !isPast(appointmentDate) && appointment.status === 'scheduled';
      } else if (status === 'past') {
        return isPast(appointmentDate) || ['completed', 'cancelled'].includes(appointment.status);
      } else if (status === 'today') {
        return isToday(appointmentDate) && appointment.status === 'scheduled';
      }
      
      return false;
    });
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  if (!doctorId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Doctor ID is missing</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">Error loading appointments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          {['today', 'upcoming', 'past'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                ))
              ) : getAppointmentsByStatus(tab as 'upcoming' | 'past' | 'today').length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No {tab} appointments</p>
                </div>
              ) : (
                getAppointmentsByStatus(tab as 'upcoming' | 'past' | 'today').map((appointment: Appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{appointment.patientName || 'Patient'}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateForDisplay(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getAppointmentTypeIcon(appointment.type)}
                        <Badge variant={
                          appointment.status === 'scheduled' ? 'default' :
                          appointment.status === 'completed' ? 'secondary' : 'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {appointment.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                        </Badge>
                        <span className="text-sm">${appointment.amount}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {tab !== 'past' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Actions</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Appointment Actions</DialogTitle>
                                  <DialogDescription>
                                    Update status or manage this appointment
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3 py-4">
                                  <Button
                                    variant="default"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                  >
                                    Mark as Completed
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                  >
                                    Cancel Appointment
                                  </Button>
                                  {appointment.type === 'video' && !appointment.meetingLink && (
                                    <Button
                                      variant="secondary"
                                      onClick={() => generateMeetingLink(appointment.id)}
                                    >
                                      Generate Meeting Link
                                    </Button>
                                  )}
                                  {appointment.meetingLink && (
                                    <Button
                                      variant="secondary"
                                      onClick={() => window.open(appointment.meetingLink, '_blank')}
                                    >
                                      Join Meeting
                                    </Button>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {appointment.type === 'video' && appointment.meetingLink && (
                              <Button
                                variant="default" 
                                size="sm"
                                onClick={() => window.open(appointment.meetingLink, '_blank')}
                              >
                                Join
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DoctorAppointments;
