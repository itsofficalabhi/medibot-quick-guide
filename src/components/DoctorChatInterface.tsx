
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { Send, Video, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  content: string;
  type: MessageType;
  timestamp: Date;
}

interface DoctorChatInterfaceProps {
  doctorId: string;
  doctorName: string;
  onVideoCall?: () => void;
  onPhoneCall?: () => void;
}

const DoctorChatInterface: React.FC<DoctorChatInterfaceProps> = ({ 
  doctorId, 
  doctorName, 
  onVideoCall,
  onPhoneCall
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: `Hello! You are now chatting with Dr. ${doctorName}. How can I help you today?`,
      type: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate doctor response after a delay
    setTimeout(() => {
      const responseOptions = [
        "I understand your concern. Could you provide more details about your symptoms?",
        "Thank you for sharing that information. Based on what you've told me, I would recommend...",
        "I see. Have you experienced these symptoms before?",
        "That's important information. How long have you been experiencing this?",
        "I would need to examine you more thoroughly to give a definitive answer. Would you like to schedule a video consultation?",
        "Your symptoms could be related to several conditions. Let's discuss this further in a video call where I can better assess your situation."
      ];

      const doctorMessage: Message = {
        id: messages.length + 2,
        content: responseOptions[Math.floor(Math.random() * responseOptions.length)],
        type: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, doctorMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleVideoCall = () => {
    if (onVideoCall) {
      onVideoCall();
    } else {
      const appointmentId = `app-${Date.now()}-${doctorId}`;
      navigate(`/video-call?appointmentId=${appointmentId}`);
    }
  };

  const handlePhoneCall = () => {
    if (onPhoneCall) {
      onPhoneCall();
    } else {
      // Fallback to a simulated phone call
      window.location.href = `tel:+1234567890`;
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="bg-primary text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-2">
              <span className="font-bold text-sm">Dr</span>
            </div>
            Dr. {doctorName}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary-foreground/20"
              onClick={handleVideoCall}
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary-foreground/20"
              onClick={handlePhoneCall}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-hidden">
        <div className="chat-container h-[calc(100%-8px)] overflow-y-auto pb-2">
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              content={message.content}
              type={message.type}
              timestamp={message.timestamp}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="chat-message bot rounded-lg py-2 px-4 rounded-bl-none">
                <div className="typing-indicator">
                  <span>•</span>
                  <span>•</span>
                  <span>•</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isTyping || inputValue.trim() === ''}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DoctorChatInterface;
