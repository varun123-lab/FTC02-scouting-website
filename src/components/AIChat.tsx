import React, { useState } from 'react';
import { ScoutingEntry } from '../types';
import { fetchTeamSummary } from '../services/ftcClient';
import { Loader2 } from 'lucide-react';

const AI_BASE = import.meta.env.VITE_AI_API_URL?.replace(/\/$/, '') || '';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || '';

interface Message { role: 'user' | 'assistant' | 'system'; content: string }

interface Props {
  entry?: ScoutingEntry | null;
}

const AIChat: React.FC<Props> = ({ entry }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', content: input }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      // Optionally attach team history to system message
      const systemParts: string[] = [];
      if (entry) systemParts.push(`Context: Team ${entry.teamNumber}, Match ${entry.matchNumber}. Total score ${entry.scores.totalScore}.`);

      // Try to include team history from FTC API if available
      if (entry) {
        try {
          const teamData = await fetchTeamSummary(entry.teamNumber);
          systemParts.push('Team history: ' + JSON.stringify(teamData).slice(0, 1000));
        } catch (e) {
          // ignore team fetch errors
        }
      }

      if (AI_BASE) {
        const res = await fetch(AI_BASE + '/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next, system: systemParts.join('\n') }),
        });
        if (!res.ok) throw new Error(`AI API ${res.status}`);
        const data = await res.json();
        const reply = data.reply || data.answer || JSON.stringify(data);
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else if (PROXY_BASE) {
        // Use developer proxy chat endpoint
        try {
          const res = await fetch(PROXY_BASE + '/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: next, system: systemParts.join('\n') }),
          });
          if (!res.ok) throw new Error(`Proxy AI ${res.status}`);
          const data = await res.json();
          const reply = data.reply || data.answer || data.summary || JSON.stringify(data);
          setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (e) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Error contacting proxy AI: ' + ((e as Error).message || '') }]);
        }
      } else {
        // Local fallback: simple heuristic responder
        const last = next[next.length - 1].content.toLowerCase();
        let reply = "AI not configured. Set VITE_AI_API_URL to enable chat.";
        if (last.includes('summary') && entry) {
          reply = `Quick summary: Team ${entry.teamNumber} scored ${entry.scores.totalScore} (auto ${entry.scores.autoScore}, tele-op ${entry.scores.teleopScore}).`;
        } else if (last.includes('advice') && entry) {
          reply = 'Focus on increasing cycle efficiency and practicing full returns in endgame.';
        }
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (e.message || 'AI error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Chat</h3>
      <div className="space-y-3 max-h-64 overflow-auto border border-gray-100 dark:border-gray-700 p-3 rounded">
        {messages.length === 0 && <p className="text-sm text-gray-500">Start the conversation about this entry or team.</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
          placeholder="Ask something like: 'Give me a quick summary' or 'Any improvement suggestions?'"
        />
        <button onClick={send} disabled={loading} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
