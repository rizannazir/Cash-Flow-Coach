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
    const { rawText, transactions, openingBalance, language } = req.body;

    if (!ai) {
      // Fallback response if no GEMINI_API_KEY is configured
      return res.json({
        success: false,
        fallback: true,
        message: 'Gemini API key not configured. Using deterministic engine.',
      });
    }

    const txSampleStr = JSON.stringify(transactions || rawText, null, 2);
    const isMalayalam =
      language === 'ml' ||
      txSampleStr.includes('വാടക') ||
      txSampleStr.includes('ചായ') ||
      txSampleStr.includes('കച്ചവടം') ||
      txSampleStr.includes('ശമ്പളം') ||
      txSampleStr.includes('സാധന') ||
      txSampleStr.includes('വീട്ടുചെലവ്');

    const prompt = `You are Cash-Flow Coach, an expert Indian small business cash-flow analyst.
Analyze these financial transactions for a small Indian business owner (freelancer, shop owner, home-business, or solo entrepreneur).

Language Note:
Transactions can be written in English, Malayalam script (മലയാളം, e.g. ചായ, കട വാടക, ശമ്പളം, കച്ചവടം, പെട്രോൾ, വീട്ടുചെലവ്, സാധനങ്ങൾ വാങ്ങിയത്, കറന്റ് ബിൽ, ക്ലയന്റ് പേയ്‌മെന്റ്, പണിക്കൂലി, ചിട്ടി അടവ്), or Manglish (e.g. chaya, kada vadaka, veettu chelavu, sambalam, sadhnam vangiyath, kachavadam, upi sale).
Understand the exact meaning of all Malayalam and Manglish entries, categorize them accurately into appropriate business heads, and recognize personal drawings (വീട്ടുചെലവ് / veettu chelavu / സ്വന്തം ആവശ്യം) as Personal Withdrawals.

Language Requirement:
${
  isMalayalam
    ? 'The user wants Malayalam (മലയാളം). You MUST write "cashHealthHeadline", "cashHealthReason", the "reason" and "fix" in "topMoneyLeaks", "nextMonthFocus", and budget rationales in natural, fluent, friendly, practical Malayalam (മലയാളത്തിൽ തന്നെ എഴുതുക). Keep numbers and JSON field names in English.'
    : 'Write all feedback in clear, encouraging, friendly English.'
}

Opening Balance provided: ${openingBalance !== undefined && openingBalance !== null ? '₹' + openingBalance : 'None'}

Transactions list:
${txSampleStr}

Provide an intelligent business assessment strictly adhering to the following JSON schema:
{
  "cashHealth": "manageable" | "needs_attention" | "shortfall_risk",
  "cashHealthHeadline": string,
  "cashHealthReason": string,
  "topMoneyLeaks": [
    {
      "category": string,
      "amount": number,
      "percentage": number,
      "reason": string,
      "fix": string
    }
  ],
  "nextMonthFocus": string,
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

    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), 12000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text || '';
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return res.json({
      success: true,
      analysis: parsedData,
    });
  } catch (error: any) {
    // Graceful fallback response on timeout or error
    return res.status(200).json({
      success: false,
      fallback: true,
      error: error?.message || 'AI analysis fallback',
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
