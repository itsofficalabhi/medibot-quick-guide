
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { getResponseWithDelay, checkApiConnection, getDirectResponse } from '@/utils/chatUtils';
import DisclaimerBanner from './DisclaimerBanner';
import { Bot, WifiOff, RefreshCw } from 'lucide-react';
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
  const [connectionRetries, setConnectionRetries] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Function to verify connection and update state
  const verifyConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const connectionStatus = await checkApiConnection();
      setIsConnected(connectionStatus);
      
      if (!connectionStatus) {
        console.log("Chat service is offline");
        if (window.location.hostname === 'localhost') {
          // In local development, we'll operate in offline mode
          setOfflineMode(true);
        } else {
          setOfflineMode(connectionRetries >= 3);
        }
      } else {
        console.log("Chat service is online");
        // Reset retry count and offline mode when connection is successful
        setConnectionRetries(0);
        setOfflineMode(false);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsConnected(false);
      setOfflineMode(connectionRetries >= 3);
    } finally {
      setIsCheckingConnection(false);
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
  
  // Retry connection with exponential backoff
  const handleRetryConnection = () => {
    const retryCount = connectionRetries + 1;
    setConnectionRetries(retryCount);
    
    const backoffTime = Math.min(2000 * Math.pow(2, retryCount - 1), 30000); // Max 30 seconds
    
    toast({
      title: "Reconnecting...",
      description: `Attempting to reconnect to the chat service. Attempt ${retryCount}`,
    });
    
    setTimeout(() => {
      verifyConnection();
    }, backoffTime);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Allow sending messages even when offline if offline mode is enabled
    if (!isConnected && !offlineMode) {
      toast({
        title: "Connection Error",
        description: "You appear to be offline. Please check your connection or enable offline mode to continue with limited functionality.",
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

    if (offlineMode) {
      // Use direct response in offline mode
      setIsTyping(true);
      setTimeout(() => {
        const response = getDirectResponse(userMessage.content);
        const botMessage: Message = {
          id: messages.length + 2,
          content: response,
          type: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Process the user message and get a response from the API
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    toast({
      title: offlineMode ? "Offline Mode Disabled" : "Offline Mode Enabled",
      description: offlineMode ? 
        "Attempting to connect to the chat service." : 
        "Using local responses. Limited functionality available.",
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-6 w-6 mr-2" />
            MediBot - AI Health Assistant
          </div>
          <div className="flex items-center space-x-2">
            {offlineMode && (
              <span className="text-sm bg-yellow-600 py-1 px-2 rounded-full">
                Offline Mode
              </span>
            )}
            {isCheckingConnection ? (
              <span className="text-sm bg-yellow-600 py-1 px-2 rounded-full flex items-center">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />Checking...
              </span>
            ) : !isConnected ? (
              <span className="text-sm bg-red-600 py-1 px-2 rounded-full flex items-center">
                <WifiOff className="h-3 w-3 mr-1" />Offline
              </span>
            ) : (
              <span className="text-sm bg-green-600 py-1 px-2 rounded-full">Online</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <DisclaimerBanner />
        
        {!isConnected && !offlineMode && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>The chat service is currently offline. Your messages won't be processed.</span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleOfflineMode}
                  className="flex items-center gap-1"
                >
                  Enable Offline Mode
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                  disabled={isCheckingConnection}
                  className="flex items-center gap-1"
                >
                  {isCheckingConnection ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry Connection
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {offlineMode && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertDescription className="flex items-center justify-between">
              <span>Running in offline mode with limited capabilities.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleOfflineMode}
                className="flex items-center gap-1"
              >
                Disable Offline Mode
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
            placeholder={(isConnected || offlineMode) ? "Ask a health question..." : "Chat is offline..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping || (!isConnected && !offlineMode)}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isTyping || inputValue.trim() === '' || (!isConnected && !offlineMode)}
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
