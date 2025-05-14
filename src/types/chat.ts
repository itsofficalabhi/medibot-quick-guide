
export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'doctor' | 'system' | 'bot';
  timestamp: string;
  attachments?: string[];
  isRead: boolean;
  intent?: string;
  entities?: any[];
  confidence?: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  doctorId?: string;
  startTime: string;
  messages: ChatMessage[];
}
