const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');
require('dotenv').config();

// Initialize the client with your key
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Main model, plus an optional backup model (set GEMINI_FALLBACK_MODEL in .env / Render).
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "High demand" (503) and rate-limit (429) errors are temporary, so we retry them.
const isBusyError = (error) => {
  const message = String((error && error.message) || '');
  return (
    message.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED')
  );
};

const generateWithRetry = async (request) => {
  const models = [MODEL, FALLBACK_MODEL].filter(Boolean);
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await client.models.generateContent({ ...request, model });
      } catch (error) {
        lastError = error;
        if (!isBusyError(error)) throw error; // real errors are not retried
        console.warn(`[Chat] ${model} busy (attempt ${attempt + 1}/3), retrying...`);
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastError;
};

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Basic validation
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // 2. Database Fetch - Using your specific Product model logic
    const products = await Product.find({}, { name: 1, category: 1, price: 1, _id: 0 });
    const productList = products.length > 0
      ? products.map(p => `- ${p.name} (${p.category}): ₹${p.price}`).join('\n')
      : "Our catalog is currently being updated.";

    // 3. System instructions
    const systemInstruction = `You are the KART.AI shopping assistant. 
    Role: Help users find products in our store. 
    Current Catalog:
    ${productList}

    Guidelines:
    - Be helpful, polite, and premium in your tone. 
    - Prices are in Rupees (₹).
    - If a product isn't in the list, politely inform the user.`;

    // 4. Stateless generation, with retry on temporary "busy" errors
    const result = await generateWithRetry({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
        }
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const text = result.text;

    res.status(200).json({
      success: true,
      reply: text
    });

  } catch (error) {
    // Audit logging: see the exact error in the server logs
    console.error('--- KART.AI CHAT SYSTEM AUDIT ERROR ---');
    console.error('Stack Trace:', error.stack);
    console.error('Message:', error.message);

    if (error.message.includes('401') || error.message.includes('API_KEY_INVALID')) {
      return res.status(500).json({ error: 'Gemini API Key is invalid or missing.' });
    }

    if (error.message.includes('404')) {
      return res.status(500).json({ error: 'The AI model was not found. Check GEMINI_MODEL.' });
    }

    if (isBusyError(error)) {
      return res.status(503).json({ error: 'The assistant is busy right now. Please try again in a moment.' });
    }

    res.status(500).json({ error: 'The shopping assistant is temporarily unavailable. Please try again.' });
  }
};

module.exports = {
  handleChat,
};
