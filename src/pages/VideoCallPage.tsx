
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, MessageSquare, Users, MoreVertical } from 'lucide-react';

const VideoCallPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isWaiting, setIsWaiting] = useState(true);
  
  useEffect(() => {
    // Simulate connecting to a call
    const timer = setTimeout(() => {
      setIsWaiting(false);
      setIsConnected(true);
      
      // Start call duration timer once connected
      const durationInterval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(durationInterval);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In a real implementation, this would use the WebRTC API to actually mute the audio
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, this would use the WebRTC API to actually turn off the video
  };
  
  const endCall = () => {
    // In a real implementation, this would properly close the WebRTC connection
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Call Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <div>
            <div className="font-semibold">Telemedicine Call</div>
            <div className="text-xs text-gray-400">Appointment ID: {appointmentId}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          {isConnected && (
            <div className="mr-4 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-sm">{formatDuration(callDuration)}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={endCall}>
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>
      
      {/* Main Video Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote Video (Full screen) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0">
          {isWaiting ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <div className="text-white text-lg font-medium">Connecting to your appointment...</div>
              <div className="text-gray-400 text-sm mt-2">Please wait, this may take a moment</div>
            </div>
          ) : isVideoEnabled ? (
            // This would be the remote video stream in a real implementation
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Doctor video"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-4xl font-semibold">Dr</span>
            </div>
          )}
        </div>
        
        {/* Local Video (Picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-40 h-32 bg-gray-800 rounded-lg overflow-hidden z-10 border-2 border-gray-700">
          {isVideoEnabled ? (
            // This would be the local video stream in a real implementation
            <img 
              src={user?.role === 'doctor' 
                ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                : "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              } 
              alt="Your video"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                {user?.name?.charAt(0) || 'Y'}
              </span>
            </div>
          )}
        </div>
        
        {/* Call Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-20">
          <Button 
            onClick={toggleAudio} 
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="icon" 
            className="rounded-full h-12 w-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            onClick={toggleVideo} 
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="icon" 
            className="rounded-full h-12 w-12"
          >
            {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            onClick={endCall}
            variant="destructive" 
            size="icon" 
            className="rounded-full h-14 w-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full h-12 w-12"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full h-12 w-12"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
