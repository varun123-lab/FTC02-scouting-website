import React, { useState, useRef, useEffect } from 'react';
import { ScoutingEntry } from '../types';
import { fetchTeamSummary } from '../services/ftcClient';
import { Loader2, Send, MessageCircle, Bot, User } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    const next = [...messages, { role: 'user' as const, content: userMessage }];
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
        // Local fallback: enhanced heuristic responder
        const last = userMessage.toLowerCase();
        let reply = "🤖 AI is running locally. For enhanced responses, configure VITE_AI_API_URL.";
        
        if (entry) {
          if (last.includes('summary') || last.includes('overview')) {
            reply = `📊 **Team ${entry.teamNumber} Summary**\n\n• Total Score: ${entry.scores.totalScore} points\n• Auto: ${entry.scores.autoScore} pts\n• Tele-Op: ${entry.scores.teleopScore} pts\n• Endgame: ${entry.scores.endgameScore} pts\n\n${entry.scores.autoScore >= 15 ? '✅ Strong autonomous phase' : '⚠️ Room for improvement in auto'}\n${entry.scores.teleopScore >= 25 ? '✅ Good tele-op efficiency' : '⚠️ Could improve tele-op cycles'}`;
          } else if (last.includes('advice') || last.includes('improve') || last.includes('suggestion')) {
            const suggestions: string[] = [];
            if (entry.scores.autoScore < 15) suggestions.push('• Practice autonomous routines for more consistent starts');
            if (entry.teleop?.cyclesCompleted && entry.teleop.cyclesCompleted < 3) suggestions.push('• Focus on faster cycle times in tele-op');
            if (entry.endgame?.baseFullRobots === 0) suggestions.push('• Work on reliable full-base returns (+10 bonus)');
            if (entry.teleop?.patternMatches && entry.teleop.patternMatches < 2) suggestions.push('• Practice pattern matching for MOTIF bonuses');
            reply = suggestions.length > 0 
              ? `💡 **Improvement Suggestions for Team ${entry.teamNumber}:**\n\n${suggestions.join('\n')}`
              : `✨ Team ${entry.teamNumber} is performing well! Keep up the consistent play.`;
          } else if (last.includes('strength') || last.includes('good')) {
            const strengths: string[] = [];
            if (entry.scores.autoScore >= 15) strengths.push('• Strong autonomous scoring');
            if (entry.scores.teleopScore >= 25) strengths.push('• Efficient tele-op cycles');
            if (entry.scores.endgameScore >= 15) strengths.push('• Reliable endgame returns');
            if (entry.defenseRating && entry.defenseRating >= 4) strengths.push('• Solid defensive capabilities');
            if (entry.speedRating && entry.speedRating >= 4) strengths.push('• Fast and agile robot');
            reply = strengths.length > 0
              ? `💪 **Team ${entry.teamNumber} Strengths:**\n\n${strengths.join('\n')}`
              : `📈 Team ${entry.teamNumber} shows balanced performance across all areas.`;
          } else if (last.includes('compare') || last.includes('versus') || last.includes('vs')) {
            reply = `📊 For team comparisons, check out the Analytics page where you can use the AI Team Comparison tool!`;
          } else {
            reply = `🤖 I can help with:\n• "Give me a summary" - Overview of this entry\n• "What should they improve?" - Suggestions\n• "What are their strengths?" - Highlight positives\n\nTeam ${entry.teamNumber} scored ${entry.scores.totalScore} points in Match ${entry.matchNumber}.`;
          }
        }
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error: ' + (e.message || 'AI error') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h3>
        </div>
      </div>

      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Ask me about this team or entry!</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Try: "Give me a summary" or "What should they improve?"</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm ${
                m.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ask about this team..."
            disabled={loading}
          />
          <button 
            onClick={send} 
            disabled={loading || !input.trim()} 
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
