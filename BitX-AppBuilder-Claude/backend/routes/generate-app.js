// backend/routes/generate-app.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ✅ Robust JSON extractor
function extractJSON(text) {
  try {
    // Remove code block wrappers if they exist
    const cleaned = text.replace(/```json|```/g, '').trim();

    // Extract the first JSON object using regex
    const match = cleaned.match(/{[\s\S]*?}/);
    if (!match) throw new Error('No valid JSON found in Claude’s response');

    return JSON.parse(match[0]);
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    throw new Error('Claude returned invalid JSON');
  }
}

// ✅ Call Claude Sonnet 4 API
async function generateWithClaude(prompt) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('Claude API key missing in .env');

  const fullPrompt = `
You are an AI developer that returns production-ready full-stack web app code.

Output must be strictly in JSON format with keys: frontend, backend, ui.
Only return the JSON object. No explanations.

Prompt: ${prompt}
  `;

  try {
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514', // ✅ Latest Sonnet model
        max_tokens: 60000,
        temperature: 0.7,
        messages: [{ role: 'user', content: fullPrompt }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📥 Claude API raw response:', JSON.stringify(res.data, null, 2));

    const text =
      res.data.completion ||
      res.data.choices?.[0]?.message?.content ||
      res.data.content?.[0]?.text;

    if (!text) throw new Error('Empty response from Claude');
    return text;
  } catch (err) {
    console.error('❌ Claude API request failed:', err.response?.data || err.message);
    throw err;
  }
}

// ✅ POST /api/generate-app
router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  console.log('📩 Prompt:', prompt);

  try {
    const claudeText = await generateWithClaude(prompt);
    console.log('✅ Claude responded.');
    const parsed = extractJSON(claudeText);
    return res.json({ output: parsed, source: 'claude' });
  } catch (err) {
    console.error('❌ Claude failed:', err.message);
    return res.status(500).json({ error: 'Claude failed', details: err.message });
  }
});

export default router;

