import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client lazily
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'DineFlow AI' });
  });

  // Visit Intelligence Endpoint
  app.post('/api/gemini/visit-intelligence', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const systemInstruction = `You are DineFlow AI – Restaurant Intelligence Engine.
Analyze the diner's natural language input describing their upcoming visit (e.g. "It's my mother's birthday. My grandfather uses a wheelchair. We have a movie at 8 PM. Peanut allergy, need Jain food, quiet place").
Extract structured visit intelligence matching strictly this JSON schema:
{
  "occasion": "string (e.g., Birthday, Anniversary, Business Meeting, Family Visit, Casual, Date Night)",
  "dietary_preference": "string (e.g., Jain, Vegan, Vegetarian, Non-Veg, Gluten-Free, Standard)",
  "allergies": "string (e.g., Peanuts, Dairy, Nuts, Seafood, None)",
  "accessibility": "string (e.g., Wheelchair required, Ground floor seating, Elevator access, None)",
  "seating_preference": "string (e.g., Quiet corner, Window table, High chair for child, Outdoor, Standard)",
  "time_constraints": "string (e.g., Express dining - Movie at 8 PM, 30 mins, None)",
  "spice_preference": "string (e.g., Mild, Medium, Spicy, Standard)",
  "special_requests": "string (e.g., Bring birthday slice with candle, Water at table upon arrival, None)",
  "priority": "string ('High' | 'Medium' | 'Normal')"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: `Customer visit description: "${prompt}"` }] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.raw_input = prompt;
      return res.json(parsedData);
    } catch (err: any) {
      console.error('Visit Intelligence API error:', err);
      return res.status(500).json({ error: err.message || 'Failed to extract visit intelligence' });
    }
  });

  // AI Operations Assistant Endpoint
  app.post('/api/gemini/operations-assistant', async (req, res) => {
    try {
      const { question, contextData } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const systemInstruction = `You are DineFlow AI Restaurant Operations Assistant.
Analyze today's real customer visit intelligence, reservations, and orders provided in the context JSON.
Answer the restaurant manager's question clearly, concisely, and actionably.
Do NOT hallucinate any fake data or unprovided guests. Rely strictly on the provided context objects.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Question: "${question}"\n\nToday's Operational Context Data:\n${JSON.stringify(
                  contextData || {},
                  null,
                  2
                )}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
        },
      });

      return res.json({ answer: response.text || 'No operational advice generated.' });
    } catch (err: any) {
      console.error('Operations Assistant API error:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate operational advice' });
    }
  });

  // Rejection Reason Polite Rewriter Endpoint
  app.post('/api/gemini/rewrite-rejection-reason', async (req, res) => {
    try {
      const { reason, customerName } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const systemInstruction = `You are DineFlow AI Hospitality & Customer Care Assistant.
Rewrite the internal restaurant staff's reason for being unable to fulfill a request or reservation into a warm, polite, customer-friendly message that apologizes graciously and offers alternatives.
Keep it under 3 sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Customer Name: "${customerName || 'Guest'}"\nStaff Raw Reason: "${
                  reason || 'Unable to fulfill request'
                }"`,
              },
            ],
          },
        ],
        config: { systemInstruction },
      });

      return res.json({ politeReason: response.text?.trim() || reason });
    } catch (err: any) {
      console.error('Rewrite Reason API error:', err);
      return res.status(500).json({ error: err.message || reason });
    }
  });

  // Vite development middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DineFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
