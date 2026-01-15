import React, { useState } from 'react';
import { fetchTeamSummary } from '../services/ftcClient';
import { Loader2 } from 'lucide-react';

interface Props {
  teamNumber: string;
}

const TeamHistory: React.FC<Props> = ({ teamNumber }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const d = await fetchTeamSummary(teamNumber);
      setData(d);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch team history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team History</h3>
        <button
          onClick={load}
          className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch History'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {data ? (
        <div className="text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-auto">
          <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">No history loaded. Click Fetch History.</p>
      )}
    </div>
  );
};

export default TeamHistory;
