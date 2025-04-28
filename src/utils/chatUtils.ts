
import { faqList, emergencyKeywords, emergencyResponses, fallbackResponses } from '@/data/faqData';

export const processUserInput = (userInput: string): string => {
  // Convert to lowercase for easier matching
  const input = userInput.toLowerCase();
  
  // Check for emergency keywords
  if (emergencyKeywords.some(keyword => input.includes(keyword))) {
    return getRandomResponse(emergencyResponses);
  }
  
  // Look for matches in FAQ data
  const matchingFaqs = faqList.filter(faq => 
    faq.keywords.some(keyword => input.includes(keyword)) || 
    input.includes(faq.question.toLowerCase())
  );
  
  if (matchingFaqs.length > 0) {
    // Return the most relevant FAQ answer (simple matching for now)
    return matchingFaqs[0].answer;
  }
  
  // Return a fallback response if no match found
  return getRandomResponse(fallbackResponses);
};

export const getRandomResponse = (responses: string[]): string => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

// Simulate typing delay for more natural bot responses
export const getResponseWithDelay = (
  userInput: string, 
  setTyping: (typing: boolean) => void,
  callback: (response: string) => void
): void => {
  setTyping(true);
  
  // Calculate a realistic typing delay based on response length
  // (between 1-3 seconds)
  setTimeout(() => {
    const response = processUserInput(userInput);
    setTyping(false);
    callback(response);
  }, Math.min(1000 + userInput.length * 10, 3000));
};
