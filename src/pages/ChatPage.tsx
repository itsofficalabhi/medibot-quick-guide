
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare, MessageCircle, Phone, Video } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'doctors'>('ai');

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Online doctors that a user could chat with */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <div className="relative">
                    <img 
                      src={`https://images.unsplash.com/photo-${i % 2 === 0 ? '1622902046580-2b7f29d0f685' : '1622253692010-333f2da6031d'}?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350&q=80`} 
                      alt={`Doctor ${i}`} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-white text-xs font-medium">
                      Online
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">Dr. {['John', 'Emily', 'Michael', 'Sarah', 'David', 'Lisa'][i-1]} {['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][i-1]}</h3>
                    <p className="text-primary text-sm">{['General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology', 'Mental Health', 'Orthopedics'][i-1]}</p>
                    
                    <div className="flex items-center mt-3 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${j < 4 ? "text-yellow-400" : "text-muted"}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">({30 + i * 10})</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
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
