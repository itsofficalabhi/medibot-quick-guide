
import { chatAPI } from '@/services/api';

// Function to process user input and get AI response
export const processUserInput = async (userInput: string): Promise<string> => {
  try {
    const response = await chatAPI.sendMessage(userInput);
    return response.data.response;
  } catch (error) {
    console.error('Error processing message with AI:', error);
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
    // Calculate a realistic typing delay based on response length
    setTimeout(async () => {
      const response = await processUserInput(userInput);
      setTyping(false);
      callback(response);
    }, 1500); // Fixed delay for better UX
  } catch (error) {
    setTyping(false);
    callback(getFallbackResponse());
  }
};
