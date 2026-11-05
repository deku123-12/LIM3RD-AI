const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Kailangan ng valid message array.' });
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error('Walang nahanap na GROQ_API_KEY sa Render Environment Variables.');
    }

    // Pwede mong gamitin ang 'openai/gpt-oss-20b' o 'llama-3.3-70b-versatile'
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Walang naibalik na sagot.";
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
