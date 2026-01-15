import React, { useState } from 'react';
import { ScoutingEntry } from '../types';
import { summarizeEntry } from '../services/aiClient';
import { Loader2, Copy, Check, Sparkles, Wand2 } from 'lucide-react';

interface Props {
  entry: ScoutingEntry;
}

const AISummary: React.FC<Props> = ({ entry }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const s = await summarizeEntry(entry as ScoutingEntry);
      setSummary(s);
    } catch (e) {
      setError((e as Error).message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {summary ? 'Regenerate' : 'Generate'}
          </button>
          {summary && (
            <button 
              onClick={copy} 
              className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {summary ? (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Click Generate to create an AI summary of this entry</p>
        </div>
      )}
    </div>
  );
};

export default AISummary;
