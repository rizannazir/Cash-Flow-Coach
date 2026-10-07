import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// AI Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { rawText, transactions, openingBalance } = req.body;

    if (!ai) {
      // Fallback response if no GEMINI_API_KEY is configured
      return res.json({
        success: false,
        fallback: true,
        message: 'Gemini API key not configured. Using deterministic engine.',
      });
    }

    const prompt = `You are Cash-Flow Coach, an expert Indian small business cash-flow analyst.
Analyze these financial transactions for a small Indian business owner (freelancer, shop owner, home-business, or solo entrepreneur).

Opening Balance provided: ${openingBalance !== undefined && openingBalance !== null ? '₹' + openingBalance : 'None'}

Transactions list:
${JSON.stringify(transactions || rawText, null, 2)}

Provide an intelligent business assessment strictly adhering to the following JSON schema:
{
  "cashHealth": "manageable" | "needs_attention" | "shortfall_risk",
  "cashHealthHeadline": string (e.g. "Manageable Cash Position" or "Tight Operating Cash"),
  "cashHealthReason": string (nuanced, humble phrasing like "Based on the transactions provided, your cash position is positive, but recurring expenses could put pressure on next month's cash if income is delayed."),
  "topMoneyLeaks": [
    {
      "category": string,
      "amount": number,
      "percentage": number,
      "reason": string (Why it matters - e.g. frequent small food deliveries adding up, high transport costs),
      "fix": string (Practical, encouraging fix - e.g. "Combine delivery runs and batch grocery procurements twice a week.")
    }
  ],
  "nextMonthFocus": string (e.g. "Keep total expenses below ₹42,000 and protect at least ₹15,000 of available operating buffer."),
  "budgetRecommendations": [
    {
      "category": string,
      "recommendedBudget": number,
      "rationale": string
    }
  ],
  "potentialReviewItems": [
    {
      "description": string,
      "issue": string
    }
  ]
}

Ensure the top money leaks highlight genuine leaks (recurring small expenses like tea/snacks, high delivery/fuel costs, unmonitored software subscriptions, unnecessary personal withdrawals) rather than just the fixed business rent.
Return ONLY valid raw JSON with no Markdown backticks or explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return res.json({
      success: true,
      analysis: parsedData,
    });
  } catch (error: any) {
    console.error('Error during AI analysis:', error?.message || error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: error?.message || 'AI analysis failed, falling back to local engine',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Cash-Flow Coach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
