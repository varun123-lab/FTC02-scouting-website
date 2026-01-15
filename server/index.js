/*
  Simple Express proxy server for FTC Events API and optional AI proxy.
  - Keeps FTC API key on server-side (process.env.FTC_API_KEY)
  - Optional AI proxy (process.env.OPENAI_API_KEY)

  Usage:
    node server/index.js
  (set env vars in a .env file or your environment)
*/
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = global.fetch || require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const FTC_BASE = (process.env.FTC_API_BASE || 'https://ftc-events.firstinspires.org/v2.0').replace(/\/$/, '');
const FTC_KEY = process.env.FTC_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

function ftcRequest(path) {
  const url = `${FTC_BASE}${path}`;
  const headers = { Accept: 'application/json' };
  if (FTC_KEY) headers['Authorization'] = FTC_KEY;
  return fetch(url, { headers }).then(async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return text; }
  });
}

// Try common team endpoints
app.get('/api/ftc/team/:teamNumber', async (req, res) => {
  const t = encodeURIComponent(req.params.teamNumber);
  const endpoints = [`/teams/${t}`, `/teams/team/${t}`, `/teams?teamNumber=${t}`];
  for (const ep of endpoints) {
    try {
      const data = await fetch(`${FTC_BASE}${ep}`, { headers: { Accept: 'application/json', ...(FTC_KEY ? { Authorization: FTC_KEY } : {}) } });
      if (data.ok) {
        const json = await data.json();
        return res.json(json);
      }
    } catch (e) {
      // continue
    }
  }
  res.status(404).json({ error: 'Team not found' });
});

// AI proxy: summarize endpoint - if OPENAI_API_KEY present, call OpenAI, otherwise return 400
app.post('/api/ai/summarize', async (req, res) => {
  const { entry } = req.body || {};
  if (!entry) return res.status(400).json({ error: 'Missing entry in request body' });

  if (!OPENAI_KEY) {
    // Fallback: perform a simple server-side summary similar to client fallback
    const parts = [];
    parts.push(`Team ${entry.teamNumber} — Match ${entry.matchNumber} (${entry.alliance} alliance).`);
    parts.push(`Total score: ${entry.scores?.totalScore || 'N/A'} (Auto ${entry.scores?.autoScore || 0}, Tele-Op ${entry.scores?.teleopScore || 0}, Endgame ${entry.scores?.endgameScore || 0}).`);
    return res.json({ summary: parts.join(' ') });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes FTC scouting entries.' },
          { role: 'user', content: `Summarize the following entry: ${JSON.stringify(entry)}` }
        ],
        max_tokens: 400,
      })
    });
    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
    return res.json({ summary: reply });
  } catch (e) {
    return res.status(500).json({ error: 'AI proxy error', detail: String(e) });
  }
});

// Chat endpoint: accepts { messages, system } and forwards to OpenAI chat completions
app.post('/api/ai/chat', async (req, res) => {
  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Missing messages array' });

  if (!OPENAI_KEY) return res.status(501).json({ error: 'OpenAI key not configured on server' });

  try {
    const payload = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ],
      max_tokens: 800,
    };

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload),
    });

    const data = await openaiRes.json();
    const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
    return res.json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'AI chat proxy error', detail: String(e) });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
