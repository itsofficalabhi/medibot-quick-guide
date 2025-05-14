import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession } from '@/types/chat';

// Constants
const CHAT_SESSION_STORAGE_KEY = 'chat_session_id';
const MAX_MESSAGES_PER_SESSION = 50;

// Initialize or retrieve chat session
export const initChatSession = (userId: string, doctorId?: string): ChatSession => {
  // Check if there's an existing session ID in localStorage
  const existingSessionId = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
  
  if (existingSessionId) {
    // Return existing session
    return {
      id: existingSessionId,
      userId,
      doctorId,
      startTime: new Date().toISOString(),
      messages: []
    };
  } else {
    // Create new session
    const newSessionId = uuidv4();
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, newSessionId);
    
    return {
      id: newSessionId,
      userId,
      doctorId,
      startTime: new Date().toISOString(),
      messages: []
    };
  }
};

// Add message to chat session
export const addMessageToSession = (
  session: ChatSession,
  content: string,
  sender: 'user' | 'doctor' | 'system',
  attachments?: string[]
): ChatMessage => {
  const newMessage: ChatMessage = {
    id: uuidv4(),
    sessionId: session.id,
    content,
    sender,
    timestamp: new Date().toISOString(),
    attachments: attachments || [],
    isRead: sender !== 'user' // Messages from user are unread initially
  };
  
  // Check if we've reached the message limit
  if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
    // Remove oldest message
    session.messages.shift();
    
    toast({
      title: "Message limit reached",
      description: "Some older messages have been removed from this conversation."
    });
  }
  
  // Add new message
  session.messages.push(newMessage);
  
  return newMessage;
};

// End current chat session
export const endChatSession = (): void => {
  localStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
};

// Format timestamp for display
export const formatChatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If message is from today, just show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If message is from this year, show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString() + ' ' + 
         date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Check if user has unread messages
export const hasUnreadMessages = (session: ChatSession, currentUserId: string): boolean => {
  // For a user, check if there are unread messages from the doctor
  // For a doctor, check if there are unread messages from the user
  const userRole = session.userId === currentUserId ? 'user' : 'doctor';
  const otherRole = userRole === 'user' ? 'doctor' : 'user';
  
  return session.messages.some(msg => 
    msg.sender === otherRole && !msg.isRead
  );
};

// Mark messages as read
export const markMessagesAsRead = (session: ChatSession, currentUserId: string): void => {
  const userRole = session.userId === currentUserId ? 'user' : 'doctor';
  const otherRole = userRole === 'user' ? 'doctor' : 'user';
  
  let unreadCount = 0;
  
  session.messages.forEach(msg => {
    if (msg.sender === otherRole && !msg.isRead) {
      msg.isRead = true;
      unreadCount++;
    }
  });
  
  if (unreadCount > 0) {
    toast({
      title: "Messages marked as read",
      description: `${unreadCount} new message${unreadCount > 1 ? 's' : ''} marked as read`
    });
  }
};

// Get chat summary for preview
export const getChatSummary = (session: ChatSession): string => {
  if (session.messages.length === 0) {
    return "No messages yet";
  }
  
  const lastMessage = session.messages[session.messages.length - 1];
  
  // Truncate message if too long
  let content = lastMessage.content;
  if (content.length > 30) {
    content = content.substring(0, 30) + '...';
  }
  
  return content;
};

// Functions needed by ChatInterface.tsx
export const getResponseWithDelay = (
  message: string, 
  setIsTyping: (isTyping: boolean) => void, 
  callback: (response: any) => void
) => {
  setIsTyping(true);
  
  // Simulate API delay
  setTimeout(() => {
    const mockResponse = {
      text: getMockResponse(message),
      intent: "general_info",
      entities: [],
      confidence: 0.95
    };
    
    setIsTyping(false);
    callback(mockResponse);
  }, 1500);
};

export const getDirectResponse = (message: string) => {
  return getMockResponse(message);
};

export const resetChatSession = () => {
  // This function is similar to endChatSession but may reset other states
  endChatSession();
  // Any additional reset logic would go here
};

export const parseEntities = (entities: any[] = []) => {
  if (!entities || entities.length === 0) return "None";
  
  return entities.map(entity => entity.value || entity.text).join(", ");
};

// Helper function to generate mock responses
const getMockResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you with your health questions today?";
  } else if (lowerMessage.includes("headache")) {
    return "Headaches can have many causes including stress, dehydration, or lack of sleep. If you're experiencing severe or persistent headaches, please consult with a healthcare professional.";
  } else if (lowerMessage.includes("cold") || lowerMessage.includes("flu")) {
    return "Cold and flu symptoms can be managed with rest, fluids, and over-the-counter medications. If symptoms persist or worsen, please consult with a healthcare professional.";
  } else if (lowerMessage.includes("appointment")) {
    return "To schedule an appointment, you can use our booking system or chat directly with one of our available doctors.";
  } else {
    return "I understand you have a health question. While I can provide general information, for specific medical advice, please consult with one of our healthcare professionals.";
  }
};
