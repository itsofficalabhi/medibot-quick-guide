
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VideoCallPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [isLoading, setIsLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!appointmentId) {
      toast({
        title: "Invalid Access",
        description: "No valid appointment found for this video call.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return;
    }

    // This simulates initializing the video call API (like Zoom SDK) and joining a meeting
    const timer = setTimeout(() => {
      setIsLoading(false);
      setCallStatus('connected');
      console.log(`Connected to video call for appointment ${appointmentId}`);
    }, 2000);

    return () => {
      clearTimeout(timer);
      // This would normally clean up the video call API resources
      console.log('Cleaning up video call resources');
    };
  }, [appointmentId, navigate, toast]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    console.log(`Microphone ${!isMicOn ? 'unmuted' : 'muted'}`);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    console.log(`Camera ${!isVideoOn ? 'turned on' : 'turned off'}`);
  };

  const endCall = () => {
    setCallStatus('ended');
    // In a real implementation, this would close the video call session
    toast({
      title: "Call Ended",
      description: "Your consultation has ended. Thank you for using MediClinic.",
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center text-white">
            <Video className="h-5 w-5 mr-2" />
            <span className="font-medium">MediClinic Video Call</span>
          </div>
          <div className="text-white text-sm">
            {callStatus === 'connecting' ? 'Connecting...' : 
             callStatus === 'connected' ? 'Connected' : 'Call ended'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto p-4 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-white text-lg">Connecting to your appointment...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we set up your secure connection</p>
            </div>
          </div>
        ) : callStatus === 'ended' ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Call Ended</h2>
                <p className="text-muted-foreground mb-4">
                  Your video consultation has ended. Thank you for using our service.
                </p>
                <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Video area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main video - doctor */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg relative overflow-hidden min-h-[300px]">
                {isVideoOn ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-700 flex items-center justify-center">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Doctor" 
                      className="w-40 h-40 rounded-full border-4 border-white"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gray-700 flex flex-col items-center justify-center">
                    <User className="h-20 w-20 text-gray-500" />
                    <p className="text-white mt-4">Camera is off</p>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
                  Doctor
                </div>
              </div>
              
              {/* Patient video */}
              <div className="bg-gray-800 rounded-lg relative overflow-hidden min-h-[300px]">
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <User className="h-20 w-20 text-gray-500" />
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
                  You (Patient)
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8 pb-8">
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-12 w-12 rounded-full ${!isMicOn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-12 w-12 rounded-full ${!isVideoOn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full"
                onClick={endCall}
              >
                <Phone className="h-6 w-6 rotate-135" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;
