import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Video, 
  MessageSquare, 
  Phone,
  Calendar as CalendarIcon
} from 'lucide-react';
import { doctors } from '@/data/doctorsData';
import PaymentGateway from '@/components/PaymentGateway';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedConsultationType, setSelectedConsultationType] = useState<'video' | 'chat' | 'phone' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  // Find doctor by ID
  const doctor = doctors.find(d => d.id === id);
  
  // Generate some sample dates
  const today = new Date();
  const nextDays = [...Array(7)].map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toISOString().split('T')[0]
    };
  });

  // Sample time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleConsultationType = (type: 'video' | 'chat' | 'phone') => {
    setSelectedConsultationType(type);
  };
  
  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book an appointment");
      navigate('/login', { state: { from: `/doctors/${id}` } });
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !selectedConsultationType) {
      toast.error(selectedConsultationType 
        ? "Please select a date and time" 
        : "Please select consultation type, date, and time");
      return;
    }

    // Show payment gateway
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    
    // Handle different consultation types
    if (selectedConsultationType === 'video') {
      // Generate a unique appointment ID
      const appointmentId = `app-${Date.now()}-${id}`;
      navigate(`/video-call?appointmentId=${appointmentId}`);
    } else if (selectedConsultationType === 'chat') {
      // Open WhatsApp
      const phoneNumber = doctor?.phone || "15551234567"; // Default if missing
      const message = "Hello, I would like to start a chat consultation.";
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    } else if (selectedConsultationType === 'phone') {
      // For phone consultation, use native phone dialer
      const phoneNumber = doctor?.phone || "+15551234567"; // Default if missing
      
      // Save appointment info to localStorage for records
      const appointmentInfo = {
        doctorId: id,
        doctorName: doctor?.name,
        date: selectedDate,
        time: selectedTimeSlot,
        type: 'phone',
        status: 'confirmed'
      };
      
      const userAppointments = JSON.parse(localStorage.getItem(`appointments_${user?.id}`) || '[]');
      userAppointments.push(appointmentInfo);
      localStorage.setItem(`appointments_${user?.id}`, JSON.stringify(userAppointments));
      
      // Use the tel: protocol to open the native dialer
      window.location.href = `tel:${phoneNumber}`;
    }
    
    // Show success toast
    toast.success(`Your ${selectedConsultationType} consultation has been booked for ${selectedDate} at ${selectedTimeSlot}`);
  };
  
  const handlePaymentCancel = () => {
    setShowPayment(false);
  };
  
  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Doctor Not Found</h2>
        <p className="mb-6">The doctor you are looking for does not exist.</p>
        <Link to="/doctors">
          <Button>Back to Doctors</Button>
        </Link>
      </div>
    );
  }

  // If payment modal is shown, render that instead
  if (showPayment) {
    return (
      <div className="container mx-auto px-4 py-12">
        <PaymentGateway 
          amount={doctor.consultationFee + 5}
          appointmentDate={selectedDate || undefined} 
          appointmentTime={selectedTimeSlot || undefined}
          doctorName={doctor.name}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/doctors" className="flex items-center text-primary mb-6 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Doctors
      </Link>

      {/* Doctor Profile Header */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex justify-center md:justify-start">
            <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-primary/10">
              <img 
                src={doctor.profileImage} 
                alt={doctor.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-3/4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">{doctor.name}</h1>
                <p className="text-primary mb-2">{doctor.specialty}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-sm">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-lg font-semibold text-primary">
                  ${doctor.consultationFee}
                </div>
                <div className="text-sm">per consultation</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Experience</div>
                  <div className="text-sm text-muted-foreground">{doctor.experience} years</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Availability</div>
                  <div className="text-sm text-muted-foreground">{doctor.availability.hours}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Languages</div>
                  <div className="text-sm text-muted-foreground">{doctor.languages.join(', ')}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className={`flex items-center gap-2 ${selectedConsultationType === 'video' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => handleConsultationType('video')}
              >
                <Video className="h-4 w-4" />
                Video Consultation
              </Button>
              <Button 
                variant={selectedConsultationType === 'chat' ? "default" : "outline"} 
                className={`flex items-center gap-2 ${selectedConsultationType === 'chat' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => handleConsultationType('chat')}
              >
                <MessageSquare className="h-4 w-4" />
                Chat Consultation
              </Button>
              <Button 
                variant={selectedConsultationType === 'phone' ? "default" : "outline"} 
                className={`flex items-center gap-2 ${selectedConsultationType === 'phone' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => handleConsultationType('phone')}
              >
                <Phone className="h-4 w-4" />
                Phone Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'overview'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'reviews'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({doctor.reviewCount})
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="md:col-span-2">
          {activeTab === 'overview' ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">About {doctor.name}</h2>
                <p className="text-muted-foreground">{doctor.about}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Education & Training</h2>
                <ul className="space-y-3">
                  {doctor.education.map((edu, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-primary/10 rounded-full mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Days</h2>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div 
                      key={day}
                      className={`px-3 py-1 rounded-md text-sm ${
                        doctor.availability.days.includes(day) 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-6">Patient Reviews</h2>
              
              {/* Sample reviews */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-6 pb-6 border-b last:border-0">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">Patient {i + 1}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(Date.now() - (i * 86400000 * 2)).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <Star 
                          key={j} 
                          className={`h-4 w-4 ${j < 5 - (i % 2) ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {i % 2 === 0 
                      ? "Great experience with the doctor. Very thorough and takes time to explain everything clearly. The video consultation worked perfectly and saved me a trip to the clinic."
                      : "The doctor was knowledgeable and professional. Answered all my questions and helped me understand my condition better. Would definitely recommend."
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right column - Booking */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Book Appointment</h3>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Select Date</div>
                <div className="grid grid-cols-7 gap-1">
                  {nextDays.map((day) => (
                    <div
                      key={day.full}
                      onClick={() => setSelectedDate(day.full)}
                      className={`cursor-pointer p-2 rounded-md text-center ${
                        selectedDate === day.full
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="text-xs font-medium">{day.day}</div>
                      <div className="text-sm">{day.date}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Select Time</div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      onClick={() => setSelectedTimeSlot(time)}
                      className={`cursor-pointer p-2 rounded-md text-center text-sm ${
                        selectedTimeSlot === time
                          ? 'bg-primary text-primary-foreground'
                          : 'border hover:bg-muted'
                      }`}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Consultation Fee</span>
                  <span className="font-medium">${doctor.consultationFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <span className="font-medium">$5</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${doctor.consultationFee + 5}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!selectedDate || !selectedTimeSlot || !selectedConsultationType}
                onClick={handleBookAppointment}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
