import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScoutingEntries, deleteScoutingEntry } from '../utils/storage';
import { deleteScoutingEntryFirebase, getScoutingEntryById, isFirebaseConfigured } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, MapPin, Zap, Shield, Route, Trash2, RefreshCw } from 'lucide-react';
import { ScoutingEntry } from '../types';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entry, setEntry] = useState<ScoutingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isCloudMode = isFirebaseConfigured();
  
  // Load entry from appropriate source
  useEffect(() => {
    const loadEntry = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      if (isCloudMode) {
        const cloudEntry = await getScoutingEntryById(id);
        setEntry(cloudEntry);
      } else {
        const allEntries = getScoutingEntries();
        const localEntry = allEntries.find(e => e.id === id);
        setEntry(localEntry || null);
      }
      setIsLoading(false);
    };
    
    loadEntry();
  }, [id, isCloudMode]);
  
  // Check if current user owns this entry
  const isOwner = entry && user && entry.userId === user.id;

  const handleDelete = async () => {
    if (entry && isOwner) {
      if (isCloudMode) {
        await deleteScoutingEntryFirebase(entry.id);
      } else {
        deleteScoutingEntry(entry.id);
      }
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Entry not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary-600 dark:text-primary-400 font-medium"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Entry Details</h1>
          {isOwner ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-6 h-6 text-red-500" />
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Entry?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this scouting entry for Team {entry?.teamNumber}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 space-y-4">
        {/* Team Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm opacity-90">Team Number</p>
              <h2 className="text-4xl font-bold">{entry.teamNumber}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Score</p>
              <p className="text-4xl font-bold">{entry.scores.totalScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>Match {entry.matchNumber}</span>
            <span>•</span>
            <span className="capitalize">{entry.alliance} Alliance</span>
            <span>•</span>
            <span>by {entry.username}</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium text-green-900 dark:text-green-200">Autonomous</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {entry.scores.autoScore}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-medium text-blue-900 dark:text-blue-200">Tele-Op</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {entry.scores.teleopScore}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="font-medium text-purple-900 dark:text-purple-200">Endgame</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {entry.scores.endgameScore}
              </span>
            </div>
          </div>
        </div>

        {/* Autonomous Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Autonomous Phase
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Start Position" value={formatStartPosition(entry.auto?.startPosition)} />
            <DetailRow label="Leave Robots" value={entry.auto?.leaveRobots || 0} />
            <DetailRow label="Classified Artifacts" value={entry.auto?.classifiedArtifacts || 0} />
            <DetailRow label="Overflow Artifacts" value={entry.auto?.overflowArtifacts || 0} />
            <DetailRow label="Pattern Matches (MOTIF)" value={entry.auto?.patternMatches || 0} />
            {entry.auto?.pathNotes && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Path Notes:</p>
                <p className="text-gray-900 dark:text-white">{entry.auto.pathNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto Path Drawing */}
        {entry.auto?.autoPath && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Route className="w-5 h-5" />
              Auto Path Drawing
            </h3>
            <AutoPathViewer 
              pathData={entry.auto.autoPath} 
              startPosition={entry.auto.startPosition}
            />
          </div>
        )}

        {/* Tele-Op Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Tele-Op Phase
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Classified Artifacts" value={entry.teleop?.classifiedArtifacts || 0} />
            <DetailRow label="Overflow Artifacts" value={entry.teleop?.overflowArtifacts || 0} />
            <DetailRow label="Depot Artifacts" value={entry.teleop?.depotArtifacts || 0} />
            <DetailRow label="Pattern Matches (MOTIF)" value={entry.teleop?.patternMatches || 0} />
            <DetailRow label="Cycles Completed" value={entry.teleop?.cyclesCompleted || 0} />
          </div>
        </div>

        {/* Endgame Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🏁 Endgame Phase</h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Base Partial Returns" value={entry.endgame?.basePartialRobots || 0} />
            <DetailRow label="Base Full Returns" value={entry.endgame?.baseFullRobots || 0} />
          </div>
        </div>

        {/* Performance Ratings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Performance Ratings
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Defense</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.defenseRating}/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(entry.defenseRating / 5) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Speed</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.speedRating}/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(entry.speedRating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Recorded on {new Date(entry.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string | number;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white capitalize">{value}</span>
    </div>
  );
};

// Format start position to readable text
const formatStartPosition = (pos?: string): string => {
  if (!pos) return 'Not Set';
  const positions: Record<string, string> = {
    'blue-classifier': 'Blue Against Classifier',
    'blue-launch': 'Blue Launch Zone',
    'red-classifier': 'Red Against Classifier',
    'red-launch': 'Red Launch Zone',
  };
  return positions[pos] || pos;
};

// Auto Path Viewer Component
interface AutoPathViewerProps {
  pathData: { id: string; paths: any[] } | string;
  startPosition?: string;
}

const AutoPathViewer: React.FC<AutoPathViewerProps> = ({ pathData, startPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fieldImage, setFieldImage] = useState<HTMLImageElement | null>(null);
  const CANVAS_SIZE = 300;

  useEffect(() => {
    const img = new Image();
    img.src = '/ftc.png';
    img.onload = () => setFieldImage(img);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw field background
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    if (fieldImage) {
      ctx.drawImage(fieldImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    // Draw starting position
    if (startPosition) {
      const positions: Record<string, { x: number; y: number }> = {
        'blue-classifier': { x: CANVAS_SIZE * 0.15, y: CANVAS_SIZE * 0.85 },
        'blue-launch': { x: CANVAS_SIZE * 0.35, y: CANVAS_SIZE * 0.85 },
        'red-classifier': { x: CANVAS_SIZE * 0.65, y: CANVAS_SIZE * 0.15 },
        'red-launch': { x: CANVAS_SIZE * 0.85, y: CANVAS_SIZE * 0.15 },
      };
      const startPos = positions[startPosition];
      if (startPos) {
        const isBlue = startPosition.startsWith('blue');
        ctx.strokeStyle = isBlue ? '#3B82F6' : '#EF4444';
        ctx.lineWidth = 2;
        ctx.fillStyle = isBlue ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Parse and draw paths
    let paths: any[] = [];
    try {
      if (typeof pathData === 'string') {
        paths = JSON.parse(pathData);
      } else if (pathData.paths) {
        paths = pathData.paths;
      }
    } catch (e) {
      console.error('Failed to parse path data');
      return;
    }

    // Scale factor (original canvas was 360, this one is 300)
    const scale = CANVAS_SIZE / 360;

    paths.forEach((path: any) => {
      if (path.tool === 'dot' && path.points?.[0]) {
        // Draw dot
        const point = path.points[0];
        ctx.fillStyle = path.color || '#3B82F6';
        ctx.beginPath();
        ctx.arc(point.x * scale, point.y * scale, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (path.points && path.points.length > 1) {
        // Draw line path
        const points = path.points;
        ctx.strokeStyle = path.color || '#3B82F6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x * scale, points[0].y * scale);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * scale, points[i].y * scale);
        }
        ctx.stroke();

        // Draw start point (green)
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(points[0].x * scale, points[0].y * scale, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw end point (red)
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(points[points.length - 1].x * scale, points[points.length - 1].y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (Array.isArray(path) && path.length > 1) {
        // Handle old format (array of points directly)
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(path[0].x * scale, path[0].y * scale);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x * scale, path[i].y * scale);
        }
        ctx.stroke();

        // Draw start/end points
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(path[0].x * scale, path[0].y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(path[path.length - 1].x * scale, path[path.length - 1].y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [pathData, startPosition, fieldImage]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="w-full max-w-[300px] border-2 border-gray-300 dark:border-gray-600 rounded-lg"
      />
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Start
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span> End
        </span>
      </div>
    </div>
  );
};

export default EntryDetail;
