
export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'doctor' | 'system';
  timestamp: string;
  attachments: string[];
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  doctorId?: string;
  startTime: string;
  messages: ChatMessage[];
}
