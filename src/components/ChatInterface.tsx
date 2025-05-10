
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { getResponseWithDelay, getDirectResponse } from '@/utils/chatUtils';
import DisclaimerBanner from './DisclaimerBanner';
import { Bot } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
            <span className="text-sm bg-green-600 py-1 px-2 rounded-full">Online</span>
          </div>
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
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isTyping || inputValue.trim() === ''}
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
