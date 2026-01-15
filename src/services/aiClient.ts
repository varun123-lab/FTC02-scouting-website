import { ScoutingEntry } from '../types';

// AI client: calls an external AI service if VITE_AI_API_URL is set,
// otherwise falls back to a lightweight local summarizer.

const AI_BASE = import.meta.env.VITE_AI_API_URL || '';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL || '';

export async function summarizeEntry(entry: ScoutingEntry): Promise<string> {
  // 1) Try direct AI URL if configured
  if (AI_BASE) {
    const url = AI_BASE.replace(/\/$/, '') + '/v1/summarize';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`AI API error: ${res.status} ${text}`);
      }
      const data = await res.json();
      return data.summary || data.result || JSON.stringify(data);
    } catch (e) {
      console.warn('Direct AI call failed, falling back:', (e as Error).message);
    }
  }

  // 2) Try developer proxy (server) if configured
  if (PROXY_BASE) {
    try {
      const url = PROXY_BASE.replace(/\/$/, '') + '/api/ai/summarize';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.summary || data.result || JSON.stringify(data);
      }
    } catch (e) {
      console.warn('Proxy AI call failed:', (e as Error).message);
    }
  }

  // 3) Local summarizer fallback (deterministic, privacy-friendly)
  return localSummarize(entry);
}

function localSummarize(entry: ScoutingEntry): string {
  const parts: string[] = [];
  parts.push(`Team ${entry.teamNumber} — Match ${entry.matchNumber} (${entry.alliance} alliance).`);
  parts.push(`Total score: ${entry.scores.totalScore} (Auto ${entry.scores.autoScore}, Tele-Op ${entry.scores.teleopScore}, Endgame ${entry.scores.endgameScore}).`);

  // Highlights heuristics
  if (entry.scores.autoScore >= 20) parts.push('Strong autonomous performance — reliable early scoring.');
  if (entry.scores.teleopScore >= 30) parts.push('High tele-op throughput — efficient cycles.');
  if (entry.scores.endgameScore >= 15) parts.push('Good endgame — returns/parking consistent.');

  if (entry.defenseRating >= 4) parts.push('Plays strong defense when needed.');
  if (entry.speedRating >= 4) parts.push('Above-average speed/agility.');

  // Suggestions
  const suggestions: string[] = [];
  if (entry.patternMatches && entry.patternMatches < 3) suggestions.push('Work on motif/pattern alignment to increase pattern bonuses.');
  if (entry.teleop?.cyclesCompleted && entry.teleop.cyclesCompleted < 3) suggestions.push('Improve cycle efficiency to increase tele-op scoring.');
  if (entry.endgame?.baseFullRobots === 0) suggestions.push('Practice full-base returns for the +10 bonus.');

  if (entry.notes && entry.notes.trim().length > 0) {
    parts.push('Scout notes: ' + (entry.notes.length > 250 ? entry.notes.slice(0, 247) + '...' : entry.notes));
  }

  if (suggestions.length) parts.push('Suggestions: ' + suggestions.join(' '));

  return parts.join(' ');
}

export default { summarizeEntry };
