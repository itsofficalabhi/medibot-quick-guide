
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ChatMessage, { MessageType } from './ChatMessage';
import { getResponseWithDelay } from '@/utils/chatUtils';
import DisclaimerBanner from './DisclaimerBanner';

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
      content: "Hello! I'm MediBot, a health information assistant. I can answer general health questions. How can I help you today?",
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 mr-2"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          MediBot - Health FAQ Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <DisclaimerBanner />
        <div className="chat-container overflow-y-auto p-2">
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
          >
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
