import { chatAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { faqList, emergencyKeywords, emergencyResponses, fallbackResponses } from '@/data/faqData';

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

// Function to process user input and get AI response
export const processUserInput = async (userInput: string): Promise<string> => {
  try {
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
    
    const response = await chatAPI.sendMessage(userInput);
    
    if (response.data.error) {
      console.error('API returned an error:', response.data.error);
      toast({
        title: "Response Error",
        description: "The chat service responded with an error. Please try again.",
        variant: "destructive",
      });
      return response.data.response || getFallbackResponse();
    }
    
    return response.data.response;
  } catch (error) {
    console.error('Error processing message with AI:', error);
    toast({
      title: "Connection Error",
      description: "Could not connect to the chat service. Please try again later.",
      variant: "destructive",
    });
    return getFallbackResponse();
  }
};

// Get a fallback response when API fails
export const getFallbackResponse = (): string => {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

// Check if the API server is available
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking API connection...');
    
    // Use the API client instead of fetch for consistent behavior
    const response = await chatAPI.checkHealth();
    
    if (response.status === 200) {
      console.log('API connection check result:', response.data);
      return response.data.status === 'ok';
    }
    return false;
  } catch (error) {
    console.error('API connection check failed:', error);
    
    // If we can't connect to the deployed API, fall back to local development mode
    if (window.location.hostname === 'localhost') {
      console.log('Running in local development mode, simulating online status');
      return true;
    }
    
    return false;
  }
};

// Simulate typing delay for more natural bot responses
export const getResponseWithDelay = async (
  userInput: string, 
  setTyping: (typing: boolean) => void,
  callback: (response: string) => void
): Promise<void> => {
  setTyping(true);
  
  try {
    // Use a more reliable approach with Promise.race for timeout
    const responsePromise = processUserInput(userInput);
    
    // Set a minimum delay for better UX
    const delay = new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set a timeout for the response
    const timeoutPromise = new Promise<string>((_, reject) => 
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
    callback(getFallbackResponse());
  }
};

// Add a new function for direct chat without API in case of connection issues
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
  
  return "I'm currently operating in offline mode with limited capabilities. I can answer basic questions but for more complex queries, please try again when I'm back online.";
};
