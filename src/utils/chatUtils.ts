
import { chatAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { faqList, emergencyKeywords, emergencyResponses, fallbackResponses } from '@/data/faqData';
import { v4 as uuidv4 } from 'uuid';

// Store session ID for context tracking
let chatSessionId = localStorage.getItem('chat_session_id') || uuidv4();

// Ensure session ID persists
if (!localStorage.getItem('chat_session_id')) {
  localStorage.setItem('chat_session_id', chatSessionId);
}

// Check for emergency keywords in user input
const checkForEmergency = (userInput: string): string | null => {
  const normalizedInput = userInput.toLowerCase();
  
  for (const keyword of emergencyKeywords) {
    if (normalizedInput.includes(keyword)) {
      // Return random emergency response
      return emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];
    }
  }
  
  return null;
};

// Check for FAQ matches
const checkForFAQMatch = (userInput: string): string | null => {
  const normalizedInput = userInput.toLowerCase();
  
  for (const faq of faqList) {
    const isMatch = faq.keywords.some(keyword => normalizedInput.includes(keyword.toLowerCase()));
    if (isMatch) {
      return faq.answer;
    }
  }
  
  return null;
};

// Parse entities from NLP response into a readable format
export const parseEntities = (entities: any[] = []): string => {
  if (!entities || entities.length === 0) return '';
  
  return entities
    .map(entity => `${entity.type}: ${entity.value}`)
    .join(', ');
};

// Function to process user input and get NLP response
export const processUserInput = async (userInput: string): Promise<{
  text: string;
  intent?: string;
  entities?: any[];
  confidence?: number;
}> => {
  try {
    // Check for emergency keywords first
    const emergencyResponse = checkForEmergency(userInput);
    if (emergencyResponse) {
      return {
        text: emergencyResponse,
        intent: 'emergency'
      };
    }
    
    // Check FAQ for quick responses to common questions
    const faqResponse = checkForFAQMatch(userInput);
    if (faqResponse) {
      return {
        text: faqResponse,
        intent: 'faq'
      };
    }
    
    // Use the NLP API to process the message
    const response = await chatAPI.sendMessage(userInput, chatSessionId);
    
    if (response.data.error) {
      console.error('API returned an error:', response.data.error);
      toast({
        title: "Response Error",
        description: "The chat service responded with an error. Please try again.",
        variant: "destructive",
      });
      return {
        text: response.data.response || getFallbackResponse(),
        intent: 'error'
      };
    }
    
    // Log the interaction for analytics
    try {
      const userId = JSON.parse(localStorage.getItem('mediclinic_user') || '{}')?.id;
      chatAPI.logChat(
        chatSessionId, 
        userInput, 
        response.data.response, 
        userId
      );
    } catch (logError) {
      console.error('Error logging chat interaction:', logError);
    }
    
    return {
      text: response.data.response,
      intent: response.data.intent,
      entities: response.data.entities,
      confidence: response.data.confidence
    };
  } catch (error) {
    console.error('Error processing message with NLP:', error);
    toast({
      title: "Connection Error",
      description: "Could not connect to the chat service. Please try again later.",
      variant: "destructive",
    });
    return {
      text: getFallbackResponse(),
      intent: 'error'
    };
  }
};

// Get a fallback response when API fails
export const getFallbackResponse = (): string => {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

// Simulate typing delay for more natural bot responses
export const getResponseWithDelay = async (
  userInput: string, 
  setTyping: (typing: boolean) => void,
  callback: (response: {
    text: string;
    intent?: string;
    entities?: any[];
    confidence?: number;
  }) => void
): Promise<void> => {
  setTyping(true);
  
  try {
    // Use a more reliable approach with Promise.race for timeout
    const responsePromise = processUserInput(userInput);
    
    // Set a minimum delay for better UX
    const delay = new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set a timeout for the response
    const timeoutPromise = new Promise<{text: string; intent: string}>((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );
    
    // Wait for both the API response and the minimum delay
    const [response] = await Promise.all([
      Promise.race([responsePromise, timeoutPromise]), 
      delay
    ]);
    
    setTyping(false);
    callback(response);
  } catch (error) {
    console.error('Error in getResponseWithDelay:', error);
    setTyping(false);
    callback({
      text: getFallbackResponse(),
      intent: 'error'
    });
  }
};

// Get a direct response for FAQ or emergency situations
export const getDirectResponse = (userInput: string): string => {
  // Check for emergency keywords first
  const emergencyResponse = checkForEmergency(userInput);
  if (emergencyResponse) {
    return emergencyResponse;
  }
  
  // Check FAQ for quick responses to common questions
  const faqResponse = checkForFAQMatch(userInput);
  if (faqResponse) {
    return faqResponse;
  }
  
  return "I'll help you with that. Please wait while I process your request.";
};

// Reset the chat session for a new conversation
export const resetChatSession = (): void => {
  chatSessionId = uuidv4();
  localStorage.setItem('chat_session_id', chatSessionId);
};

