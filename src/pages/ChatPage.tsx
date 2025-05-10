
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import DoctorChatInterface from '@/components/DoctorChatInterface';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MessageCircle, Phone, Video } from 'lucide-react';
import { doctors } from '@/data/doctorsData';

const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'doctors'>('ai');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Reset selected doctor when changing tabs
  useEffect(() => {
    setSelectedDoctor(null);
  }, [activeTab]);

  const handleStartChat = (doctorId: string) => {
    setSelectedDoctor(doctorId);
  };
  
  const handleStartVideoCall = (doctorId: string) => {
    const appointmentId = `app-${Date.now()}-${doctorId}`;
    navigate(`/video-call?appointmentId=${appointmentId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Healthcare Assistant</h1>
        <p className="text-muted-foreground">
          Get answers to your health questions or chat with a doctor
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-3 flex items-center gap-2 font-medium ${
              activeTab === 'ai'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('ai')}
          >
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </button>
          <button
            className={`px-4 py-3 flex items-center gap-2 font-medium ${
              activeTab === 'doctors'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('doctors')}
          >
            <MessageCircle className="h-4 w-4" />
            Chat with Doctors
          </button>
        </div>
      </div>
      
      {activeTab === 'ai' ? (
        <div className="max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      ) : selectedDoctor ? (
        <div className="max-w-3xl mx-auto h-[600px]">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setSelectedDoctor(null)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back to Doctors
            </Button>
          </div>
          <DoctorChatInterface 
            doctorId={selectedDoctor}
            doctorName={doctors.find(d => d.id === selectedDoctor)?.name || "Unknown"}
            onVideoCall={() => handleStartVideoCall(selectedDoctor)} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online doctors that a user could chat with */}
          {doctors.slice(0, 6).map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <div className="relative">
                    <img 
                      src={doctor.profileImage} 
                      alt={doctor.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-white text-xs font-medium">
                      Online
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-primary text-sm">{doctor.specialty}</p>
                    
                    <div className="flex items-center mt-3 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${j < Math.floor(doctor.rating) ? "text-yellow-400" : "text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">({30 + parseInt(doctor.id) * 10})</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-1"
                        onClick={() => handleStartChat(doctor.id)}
                      >
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-1"
                        onClick={() => handleStartVideoCall(doctor.id)}
                      >
                        <Video className="h-3 w-3" />
                        Video
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
