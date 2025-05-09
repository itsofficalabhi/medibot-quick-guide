
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { getResponseWithDelay, checkApiConnection } from '@/utils/chatUtils';
import DisclaimerBanner from './DisclaimerBanner';
import { Bot, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to verify connection and update state
  const verifyConnection = async () => {
    setIsCheckingConnection(true);
    const connectionStatus = await checkApiConnection();
    setIsConnected(connectionStatus);
    setIsCheckingConnection(false);
    
    if (!connectionStatus) {
      console.log("Chat service is offline");
    } else {
      console.log("Chat service is online");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if the connection to the backend is active
  useEffect(() => {
    verifyConnection();
    
    const interval = setInterval(() => {
      verifyConnection();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Retry connection
  const handleRetryConnection = () => {
    toast({
      title: "Reconnecting...",
      description: "Attempting to reconnect to the chat service.",
    });
    
    verifyConnection();
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
          {isCheckingConnection ? (
            <span className="ml-auto text-sm bg-yellow-600 py-1 px-2 rounded-full">Checking connection...</span>
          ) : !isConnected ? (
            <span className="ml-auto text-sm bg-red-600 py-1 px-2 rounded-full flex items-center">
              <WifiOff className="h-3 w-3 mr-1" />Offline
            </span>
          ) : (
            <span className="ml-auto text-sm bg-green-600 py-1 px-2 rounded-full">Online</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <DisclaimerBanner />
        
        {!isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>The chat service is currently offline. Your messages won't be processed.</span>
              <Button variant="outline" size="sm" onClick={handleRetryConnection}>
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
            placeholder={isConnected ? "Ask a health question..." : "Chat is offline..."}
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
