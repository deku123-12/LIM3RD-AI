const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Kailangan ng valid message array.' });
    }

    // Siguraduhing may API key sa Render environment
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Walang nahanap na GROQ_API_KEY sa Render Environment Variables.');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    console.log('Groq Response Data:', JSON.stringify(data)); // Makikita ito sa Render Logs

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Walang naibalik na sagot ang Groq API server.');
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Server API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 LIM3RD AI Backend running on port ${PORT}`);
});
