
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession } from '@/types/chat';

// Constants
const SYSTEM_USER_ID = 'system';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Interfaces
interface MockResponseConfig {
  keywords: string[];
  responses: string[];
}

// Parse entities from NLP processing
export const parseEntities = (entities: any[]): string => {
  if (!entities || entities.length === 0) return "None";
  return entities.map(e => `${e.entity}:${e.value}`).join(', ');
};

// Mock responses configuration
const mockResponses: MockResponseConfig[] = [
  {
    keywords: ['appointment', 'schedule', 'book'],
    responses: [
      "Okay, let's get you scheduled. What day and time works best for you?",
      "Sure, I can help with that. Could you provide a preferred date?",
      "I can assist with scheduling. Please let me know your availability."
    ]
  },
  {
    keywords: ['prescription', 'refill', 'medication'],
    responses: [
      "I can help with your prescription. Which medication are you looking to refill?",
      "To refill your prescription, I'll need the name of the medication.",
      "I'll process that for you. Can you spell out the medication name?"
    ]
  },
  {
    keywords: ['test results', 'lab results', 'report'],
    responses: [
      "Your test results are ready. Would you like to review them now?",
      "I can provide your lab results. Do you have a specific test in mind?",
      "Your report is available. I can summarize it or provide the full details."
    ]
  },
  {
    keywords: ['billing', 'insurance', 'payment'],
    responses: [
      "I can assist with billing inquiries. What questions do you have?",
      "For insurance matters, please provide your policy number.",
      "To discuss payment options, let me know what you're looking to do."
    ]
  },
  {
    keywords: ['referral', 'specialist', 'consultation'],
    responses: [
      "I can help with a referral. Which specialist are you looking to see?",
      "To request a referral, I'll need the specialist's name and location.",
      "I'll set up a specialist consultation. What are your preferences?"
    ]
  },
  {
    keywords: ['general', 'question', 'help'],
    responses: [
      "How can I assist you today?",
      "What questions do you have for me?",
      "I'm here to help. What's on your mind?"
    ]
  }
];

// Function to generate a mock response
const generateMockResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const config of mockResponses) {
    if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const randomIndex = Math.floor(Math.random() * config.responses.length);
      return config.responses[randomIndex];
    }
  }
  
  return "I'm sorry, I didn't understand your request. Please try again.";
};

// Function to reset chat session
export const resetChatSession = async (): Promise<boolean> => {
  try {
    const currentSessionId = localStorage.getItem('chat_session_id');
    if (currentSessionId) {
      localStorage.removeItem(`chat_${currentSessionId}`);
      localStorage.removeItem('chat_session_id');
    }
    return true;
  } catch (error) {
    console.error('Error resetting chat session:', error);
    toast.error("Couldn't reset chat session");
    return false;
  }
};

// Function to get direct response without delay
export const getDirectResponse = (
  message: string
): { text: string; intent?: string; entities?: any[]; confidence?: number } => {
  const mockIntent = message.toLowerCase().includes('appointment') ? 'book_appointment' :
                   message.toLowerCase().includes('prescription') ? 'prescription_refill' :
                   'general_inquiry';
  
  const mockEntities = message.toLowerCase().includes('tomorrow') ? 
                     [{ entity: 'date', value: 'tomorrow' }] : [];
                     
  const mockConfidence = Math.random() * 0.3 + 0.7; // Random between 0.7 and 1.0
  
  return { 
    text: generateMockResponse(message),
    intent: mockIntent,
    entities: mockEntities,
    confidence: mockConfidence
  };
};

// Function to get response with delay
export const getResponseWithDelay = (
  message: string,
  setTypingState: (state: boolean) => void,
  callback: (response: { text: string; intent?: string; entities?: any[]; confidence?: number }) => void
): void => {
  setTypingState(true);
  
  // Simulate thinking time
  setTimeout(() => {
    const response = getDirectResponse(message);
    setTypingState(false);
    callback(response);
  }, 1500);
};

// Function to start a chat session
export const startChatSession = async (patientId: string, doctorId: string): Promise<ChatSession | null> => {
  try {
    // Simulate API call
    const sessionId = uuidv4();
    const currentTime = new Date().toISOString();
    
    const newSession: ChatSession = {
      id: sessionId,
      userId: patientId,
      doctorId: doctorId,
      startTime: currentTime,
      messages: []
    };
    
    localStorage.setItem('chat_session_id', sessionId);
    localStorage.setItem(`chat_${sessionId}`, JSON.stringify(newSession));
    
    return newSession;
  } catch (error) {
    console.error('Error starting chat session:', error);
    toast.error("Session Start Failed", {
      description: "Could not start a new session. Please try again."
    });
    return null;
  }
};

// Function to end a chat session
export const endChatSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Simulate API call
    localStorage.removeItem('chat_session_id');
    localStorage.removeItem(`chat_${sessionId}`);
    return true;
  } catch (error) {
    console.error('Error ending chat session:', error);
    toast.error("Session End Failed", {
      description: "Could not end the session. Please try again."
    });
    return false;
  }
};

export const sendMessage = async (
  message: string,
  sessionId: string,
  patientId?: string,
  doctorId?: string
): Promise<ChatMessage | null> => {
  try {
    // Simulate API call
    
    // Update mock logic
    const mockMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      content: message,
      sender: patientId ? 'user' : (doctorId ? 'doctor' : 'system'),
      timestamp: new Date().toISOString(),
      attachments: [],
      isRead: false
    };
    
    const sessionKey = `chat_${sessionId}`;
    const existingSession = localStorage.getItem(sessionKey);
    let session: ChatSession;
    
    if (existingSession) {
      session = JSON.parse(existingSession);
    } else {
      session = {
        id: sessionId,
        userId: patientId || 'anonymous',
        doctorId,
        startTime: new Date().toISOString(),
        messages: []
      };
    }
    
    session.messages.push(mockMessage);
    localStorage.setItem(sessionKey, JSON.stringify(session));
    
    return mockMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error("Message Failed", {
      description: "Could not send message. Please try again."
    });
    return null;
  }
};

// Function to fetch chat history
export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    // Simulate API call
    const sessionKey = `chat_${sessionId}`;
    const existingSession = localStorage.getItem(sessionKey);
    
    if (existingSession) {
      const session: ChatSession = JSON.parse(existingSession);
      return session.messages;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    toast.error("History Fetch Failed", {
      description: "Could not retrieve chat history. Please try again."
    });
    return [];
  }
};

// Handle system response
export const getSystemResponse = async (
  userMessage: string,
  sessionId: string,
  patientId?: string,
  doctorId?: string
): Promise<ChatMessage | null> => {
  try {
    // Simulate API call
  
    // If we can't connect to API, generate a mock response
    console.log('Using mock response data');
    
    // Create a slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResponse = generateMockResponse(userMessage);
    
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      content: mockResponse,
      sender: doctorId ? 'doctor' : 'system',
      timestamp: new Date().toISOString(),
      attachments: [],
      isRead: false
    };
    
    const sessionKey = `chat_${sessionId}`;
    const existingSession = localStorage.getItem(sessionKey);
    let session: ChatSession;
    
    if (existingSession) {
      session = JSON.parse(existingSession);
    } else {
      session = {
        id: sessionId,
        userId: patientId || 'anonymous',
        doctorId,
        startTime: new Date().toISOString(),
        messages: []
      };
    }
    
    session.messages.push(systemMessage);
    localStorage.setItem(sessionKey, JSON.stringify(session));
    
    return systemMessage;
  } catch (error) {
    console.error('Error getting system response:', error);
    toast.error("Response Failed", {
      description: "Could not get a response. Please try again later."
    });
    return null;
  }
};
