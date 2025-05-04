
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
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to process request with OpenAI',
      response: 'I apologize, but I encountered an issue processing your question. Please try again later.'
    });
  }
});

module.exports = router;
