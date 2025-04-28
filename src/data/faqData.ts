
interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

export const faqList: FAQ[] = [
  {
    question: "What are common cold symptoms?",
    answer: "Common cold symptoms include runny or stuffy nose, sore throat, cough, mild headache, and sometimes a low fever. Rest, fluids, and over-the-counter medications can help ease symptoms.",
    keywords: ["cold", "symptoms", "runny nose", "stuffy nose", "sore throat", "cough"]
  },
  {
    question: "How can I prevent the flu?",
    answer: "The best ways to prevent flu are: getting an annual flu vaccine, washing hands regularly, avoiding close contact with sick people, covering coughs and sneezes, and avoiding touching your eyes, nose, and mouth.",
    keywords: ["flu", "prevent", "vaccine", "prevention"]
  },
  {
    question: "How much water should I drink daily?",
    answer: "Most health experts recommend drinking about 8 glasses (64 ounces) of water per day. However, individual needs may vary based on activity level, climate, and overall health.",
    keywords: ["water", "hydration", "drink", "daily"]
  },
  {
    question: "Is it normal to have headaches often?",
    answer: "Occasional headaches are common, but frequent or severe headaches may indicate underlying issues. If you have persistent, severe, or unusual headaches, consider consulting a healthcare provider.",
    keywords: ["headache", "headaches", "pain", "head"]
  },
  {
    question: "What can I do for seasonal allergies?",
    answer: "For seasonal allergies, try: staying indoors on high-pollen days, using air purifiers, keeping windows closed during high pollen times, showering after being outdoors, and discussing appropriate medications with your healthcare provider.",
    keywords: ["allergy", "allergies", "seasonal", "hayfever", "pollen"]
  },
  {
    question: "How can I improve my sleep?",
    answer: "For better sleep: maintain a regular sleep schedule, create a relaxing bedtime routine, limit screen time before bed, ensure your bedroom is dark and comfortable, avoid caffeine and heavy meals before bedtime, and exercise regularly (but not right before bed).",
    keywords: ["sleep", "insomnia", "rest", "bedtime"]
  }
];

export const emergencyResponses = [
  "This sounds like a medical emergency. Please seek immediate medical attention by calling emergency services (911 in the US) or going to the nearest emergency room.",
  "These symptoms could indicate a serious condition requiring immediate medical care. Please contact emergency services right away.",
  "Please don't wait - contact a healthcare provider immediately or go to an emergency room with these symptoms."
];

export const emergencyKeywords = [
  "chest pain",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "stroke",
  "heart attack",
  "seizure",
  "suicide",
  "severe head injury",
  "can't breathe",
  "overdose",
  "poisoning",
  "severe allergic reaction"
];

export const fallbackResponses = [
  "I'm not able to provide specific medical advice about this issue. It's best to consult with a healthcare provider for personalized guidance.",
  "This question would be best answered by a healthcare professional who can consider your specific situation.",
  "For this concern, I recommend speaking directly with a doctor who can provide proper medical advice based on your complete health history.",
  "I'm limited in my ability to address this specific health question. Please consider discussing this with a qualified healthcare provider."
];
