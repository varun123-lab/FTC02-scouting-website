import React, { useState } from 'react';
import { ScoutingEntry } from '../types';
import { summarizeEntry } from '../services/aiClient';
import { Loader2, Copy } from 'lucide-react';

interface Props {
  entry: ScoutingEntry;
}

const AISummary: React.FC<Props> = ({ entry }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Summary</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
          </button>
          {summary && (
            <button onClick={copy} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm flex items-center gap-2">
              <Copy className="w-4 h-4" /> Copy
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {summary ? (
        <div className="prose prose-sm dark:prose-invert text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {summary}
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">No AI summary yet. Click Generate to produce one.</p>
      )}
    </div>
  );
};

export default AISummary;
