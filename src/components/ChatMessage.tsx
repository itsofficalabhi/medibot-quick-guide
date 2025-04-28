
import React from 'react';
import { cn } from '@/lib/utils';

export type MessageType = 'user' | 'bot';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  content, 
  type, 
  timestamp 
}) => {
  return (
    <div className={cn(
      'flex mb-4',
      type === 'user' ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'chat-message rounded-lg py-2 px-4',
        type === 'user' ? 'user rounded-br-none' : 'bot rounded-bl-none'
      )}>
        <p>{content}</p>
        <div className={cn(
          'text-xs mt-1',
          type === 'user' ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
        )}>
          {timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
