
const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// System prompt for healthcare context
const SYSTEM_PROMPT = `You are MediBot, an AI health assistant for MediClinic. 
Provide helpful, accurate health information but always remind users that you're not 
a substitute for professional medical advice. If someone describes emergency symptoms, 
urgently advise them to seek immediate medical attention. Keep responses concise, 
informative, and user-friendly.`;

// Health check endpoint to verify service availability
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Chat service is operational' });
});

// Process message with OpenAI
router.post('/openai', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured', 
        response: 'I apologize, but my AI services are currently unavailable. Please try again later.' 
      });
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'I apologize, but I encountered an issue processing your question.';
    if (error.code === 'ECONNABORTED') {
      errorMessage += ' The request timed out. Please try again later.';
    } else if (error.response && error.response.status === 429) {
      errorMessage += ' The service is currently experiencing high demand. Please try again in a few minutes.';
    }
    
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to process request with OpenAI',
      errorDetails: error.response?.data || error.message,
      response: errorMessage
    });
  }
});

module.exports = router;
