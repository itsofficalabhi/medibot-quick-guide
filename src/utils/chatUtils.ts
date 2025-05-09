
import { chatAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

// Function to process user input and get AI response
export const processUserInput = async (userInput: string): Promise<string> => {
  try {
    const response = await chatAPI.sendMessage(userInput);
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
  const fallbackResponses = [
    "I'm having trouble connecting to my knowledge base. Can you try again in a moment?",
    "It seems there's a technical issue. Please try again shortly.",
    "I apologize, but I'm unable to process your request right now. Please try again later.",
    "My connection to the medical database seems to be interrupted. Let me try to reconnect."
  ];
  
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
};

// Simulate typing delay for more natural bot responses
export const getResponseWithDelay = async (
  userInput: string, 
  setTyping: (typing: boolean) => void,
  callback: (response: string) => void
): Promise<void> => {
  setTyping(true);
  
  try {
    // Use a more reliable approach with Promise
    const responsePromise = processUserInput(userInput);
    
    // Set a minimum delay for better UX
    const delay = new Promise(resolve => setTimeout(resolve, 1000));
    
    // Wait for both the API response and the minimum delay
    const [response] = await Promise.all([responsePromise, delay]);
    
    setTyping(false);
    callback(response);
  } catch (error) {
    console.error('Error in getResponseWithDelay:', error);
    setTyping(false);
    callback(getFallbackResponse());
  }
};
