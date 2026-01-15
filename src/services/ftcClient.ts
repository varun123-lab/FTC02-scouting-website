// Lightweight FTC Events API client.
const DEFAULT_BASE = 'https://ftc-events.firstinspires.org/v2.0';

const BASE = import.meta.env.VITE_FTC_API_URL?.replace(/\/$/, '') || DEFAULT_BASE;
const API_KEY = import.meta.env.VITE_FTC_API_KEY || '';

async function request(path: string) {
  const url = `${BASE}${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (API_KEY) headers['Authorization'] = API_KEY;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(`FTC API error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchTeamSummary(teamNumber: string) {
  // Try a few plausible endpoints; the real API may vary.
  const candidates = [
    `/teams/${encodeURIComponent(teamNumber)}`,
    `/teams/team/${encodeURIComponent(teamNumber)}`,
    `/teams?teamNumber=${encodeURIComponent(teamNumber)}`,
  ];

  for (const p of candidates) {
    try {
      const data = await request(p);
      if (data) return data;
    } catch (e: any) {
      // try next
      if (e.status === 404) continue;
      throw e;
    }
  }

  throw new Error('Team not found (checked multiple endpoints)');
}

export default { fetchTeamSummary };
