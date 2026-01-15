# FTC Scouting Proxy Server

This small Express server proxies requests to the FTC Events API and optionally to OpenAI for summarization. It keeps API keys server-side so they are not exposed to the browser.

Environment variables (create a `.env` in this folder or set them in your environment):

- `FTC_API_BASE` (optional) - defaults to `https://ftc-events.firstinspires.org/v2.0`
- `FTC_API_KEY` - your FTC API token (keep secret)
- `OPENAI_API_KEY` - optional OpenAI API key to enable server-side summarization
- `PORT` - optional server port (default 5050)

Install and run:

```bash
cd server
npm install
npm start
```

Endpoints:
- `GET /api/ftc/team/:teamNumber` - fetch team info from FTC Events API
- `POST /api/ai/summarize` - body `{ entry }` - returns `{ summary }`; will call OpenAI if `OPENAI_API_KEY` is set, otherwise returns a simple fallback summary
