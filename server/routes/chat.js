
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Environment variables for NLP service
const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

// System prompt for healthcare context
const SYSTEM_PROMPT = `You are MediBot, an AI health assistant for MediClinic. 
Provide helpful, accurate health information but always remind users that you're not 
a substitute for professional medical advice. If someone describes emergency symptoms, 
urgently advise them to seek immediate medical attention. Keep responses concise, 
informative, and user-friendly. Use the FAQs and medical terminology to provide accurate information.`;

// Health check endpoint to verify service availability
router.get('/health', (req, res) => {
  // Check connection to NLP service
  axios.get(`${NLP_SERVICE_URL}/health`)
    .then(() => {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Chat service is operational', 
        provider: 'Custom NLP Engine' 
      });
    })
    .catch(error => {
      console.error('NLP service health check failed:', error.message);
      res.status(503).json({ 
        status: 'error', 
        message: 'NLP service not available',
        details: 'The chat service is not properly connected to the NLP engine'
      });
    });
});

// Process message with Custom NLP Engine
router.post('/process', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Processing message with Custom NLP:', message);

    try {
      const response = await axios.post(
        `${NLP_SERVICE_URL}/analyze`, 
        {
          message,
          sessionId: sessionId || 'anonymous',
          systemPrompt: SYSTEM_PROMPT
        },
        { timeout: 15000 }
      );
      
      const nlpResponse = response.data;
      console.log('NLP analysis:', JSON.stringify(nlpResponse).substring(0, 100) + '...');
      
      res.json({
        response: nlpResponse.response,
        intent: nlpResponse.intent,
        entities: nlpResponse.entities,
        confidence: nlpResponse.confidence,
        context: nlpResponse.context
      });
    } catch (error) {
      console.error('NLP service error:', error.message);
      // Fallback to simple response
      res.status(500).json({
        error: 'NLP service unavailable',
        response: "I'm sorry, but I'm having trouble processing your request right now. Please try again later."
      });
    }
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      response: "I apologize, but I encountered an error processing your message. Please try again."
    });
  }
});

// Log chat analytics
router.post('/log', async (req, res) => {
  try {
    const { sessionId, message, response, userId } = req.body;
    
    console.log('Logging chat interaction:', {
      sessionId,
      userId: userId || 'anonymous',
      messageLength: message?.length,
      responseLength: response?.length,
      timestamp: new Date()
    });
    
    // In a production environment, this would save to database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging chat:', error);
    res.status(500).json({ error: 'Failed to log chat interaction' });
  }
});

// Quick test endpoint - returns a simple response without using NLP
router.post('/test', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const response = `This is a test response from the custom NLP engine. You said: "${message}". The chat service is working properly.`;
  
  res.json({ 
    response,
    intent: 'test',
    entities: [],
    confidence: 1.0
  });
});

module.exports = router;
