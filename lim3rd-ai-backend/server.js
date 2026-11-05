const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Kunin ang API Key mula sa Environment Variable (.env file)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Endpoint na tatawagin ng iyong LIM3RD AI front-end app
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Kailangan ng message prompt.' });
    }

    // Paggamit ng pinakabagong Gemini 2.5 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error sa Gemini API:', error);
    res.status(500).json({ error: 'Nagkaroon ng problema sa server response.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 LIM3RD AI Backend Server ay tumatakbo sa port ${PORT}`);
});
