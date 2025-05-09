
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { getResponseWithDelay } from '@/utils/chatUtils';
import DisclaimerBanner from './DisclaimerBanner';
import { Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: number;
  content: string;
  type: MessageType;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm MediBot, an AI health assistant. I can answer questions about health topics and provide general information. How can I help you today?",
      type: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if the connection to the backend is active
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple ping to check if the API is available
        await fetch(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        setIsConnected(true);
      } catch (error) {
        console.error('API connection check failed:', error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "You appear to be offline. Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Process the user message and get a response
    getResponseWithDelay(
      userMessage.content, 
      setIsTyping, 
      (response) => {
        const botMessage: Message = {
          id: messages.length + 2,
          content: response,
          type: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="flex items-center">
          <Bot className="h-6 w-6 mr-2" />
          MediBot - AI Health Assistant
          {!isConnected && (
            <span className="ml-auto text-sm bg-red-600 py-1 px-2 rounded-full">Offline</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <DisclaimerBanner />
        <div className="chat-container h-[400px] overflow-y-auto p-2 mb-2 border rounded-md">
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
            placeholder="Ask a health question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping || !isConnected}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isTyping || inputValue.trim() === '' || !isConnected}
            className="bg-primary hover:bg-primary/90"
          >
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
