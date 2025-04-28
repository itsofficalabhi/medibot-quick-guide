
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DisclaimerBanner: React.FC = () => {
  return (
    <Alert className="medical-disclaimer mb-6">
      <AlertTitle className="font-semibold">Medical Disclaimer</AlertTitle>
      <AlertDescription>
        This chatbot provides general health information only and is not a substitute for professional medical advice. 
        Always consult a qualified healthcare provider for medical concerns.
      </AlertDescription>
    </Alert>
  );
};

export default DisclaimerBanner;
