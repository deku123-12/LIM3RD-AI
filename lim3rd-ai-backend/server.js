const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const rawApiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

const groq = new Groq({
  apiKey: rawApiKey
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, image } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid message array required.' });
    }

    if (!rawApiKey) {
      throw new Error('GROQ_API_KEY is missing.');
    }

    const lastUserMessage = messages[messages.length - 1].content;

    if (typeof lastUserMessage === 'string' && (lastUserMessage.toLowerCase().startsWith('/image') || lastUserMessage.toLowerCase().includes('generate image') || lastUserMessage.toLowerCase().includes('draw '))) {
      let prompt = lastUserMessage.replace('/image', '').replace(/generate image of/i, '').replace(/draw/i, '').trim();
      if (!prompt) prompt = "beautiful aesthetic digital art";

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      
      return res.json({ 
        reply: `![Generated Image](${imageUrl})` 
      });
    }

    let modelToUse = 'openai/gpt-oss-20b';
    let formattedMessages = [...messages];

    if (image) {
      modelToUse = 'llama-3.2-11b-vision-preview';
      const lastMsg = formattedMessages.pop();
      
      formattedMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: typeof lastMsg.content === 'string' ? lastMsg.content : "Describe this image." },
          { type: 'image_url', image_url: { url: image } }
        ]
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: modelToUse,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    res.json({ reply });

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
