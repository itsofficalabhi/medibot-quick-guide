
import React from 'react';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">MediBot</h1>
        <p className="text-gray-600">Ask questions about common health topics and get general health information</p>
      </div>
      <ChatInterface />
      <div className="max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Remember: For specific medical advice, always consult with a qualified healthcare professional.</p>
      </div>
    </div>
  );
};

export default Index;
