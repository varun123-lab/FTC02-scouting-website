import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScoutingEntry } from '../types';
import { calculateScores } from '../utils/scoring';
import { saveScoutingEntry } from '../utils/storage';
import { addScoutingEntry, isFirebaseConfigured } from '../services/apiClient';
import { Save, ArrowLeft, Pencil, Plus, Minus, ChevronDown, ChevronUp, ClipboardCheck, Zap } from 'lucide-react';
import AutoPathCanvas from '../components/AutoPathCanvas';

type StartPosition = 'blue-classifier' | 'blue-launch' | 'red-classifier' | 'red-launch';

const ScoutingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teamNumber: '',
    matchNumber: '',
    alliance: 'blue' as 'red' | 'blue',
    auto: {
      startPosition: 'blue-classifier' as StartPosition,
      leaveRobots: 0,
      classifiedArtifacts: 0,
      overflowArtifacts: 0,
      patternMatches: 0,
      autoPath: '',
      pathNotes: '',
    },
    teleop: {
      classifiedArtifacts: 0,
      overflowArtifacts: 0,
      depotArtifacts: 0,
      patternMatches: 0,
      cyclesCompleted: 0,
    },
    endgame: {
      basePartialRobots: 0,
      baseFullRobots: 0,
    },
    notes: '',
    defenseRating: 3,
    speedRating: 3,
    driverSkill: 3,
    reliability: 3,
  });

  // Update start position when alliance changes
  const handleAllianceChange = (alliance: 'red' | 'blue') => {
    const currentPos = formData.auto.startPosition;
    const side = currentPos.split('-')[1] as 'classifier' | 'launch';
    const newStartPosition = `${alliance}-${side}` as StartPosition;
    
    setFormData({
      ...formData,
      alliance,
      auto: {
        ...formData.auto,
        startPosition: newStartPosition,
      },
    });
  };

  const [showAutoPath, setShowAutoPath] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    auto: true,
    teleop: true,
    endgame: true,
    ratings: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const Counter = ({ 
    value, 
    onChange, 
    min = 0, 
    max = 1000,
    label,
    points
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    min?: number; 
    max?: number;
    label: string;
    points: string;
  }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{points}</span>
      </div>
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-500/30"
        >
          <Minus size={24} />
        </button>
        <span className="text-3xl font-bold w-14 text-center dark:text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-green-500/30"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const scores = calculateScores({
      auto: formData.auto,
      teleop: formData.teleop,
      endgame: formData.endgame,
    });

    const entryData = {
      userId: user.id,
      username: user.username,
      teamNumber: formData.teamNumber,
      matchNumber: formData.matchNumber,
      alliance: formData.alliance,
      timestamp: new Date().toISOString(),
      auto: {
        startPosition: formData.auto.startPosition,
        leaveRobots: formData.auto.leaveRobots,
        classifiedArtifacts: formData.auto.classifiedArtifacts,
        overflowArtifacts: formData.auto.overflowArtifacts,
        patternMatches: formData.auto.patternMatches,
        autoPath: formData.auto.autoPath ? { id: Date.now().toString(), paths: JSON.parse(formData.auto.autoPath) } : undefined,
        pathNotes: formData.auto.pathNotes,
      },
      teleop: {
        classifiedArtifacts: formData.teleop.classifiedArtifacts,
        overflowArtifacts: formData.teleop.overflowArtifacts,
        depotArtifacts: formData.teleop.depotArtifacts,
        patternMatches: formData.teleop.patternMatches,
        cyclesCompleted: formData.teleop.cyclesCompleted,
      },
      endgame: {
        basePartialRobots: formData.endgame.basePartialRobots,
        baseFullRobots: formData.endgame.baseFullRobots,
      },
      scores,
      notes: formData.notes,
      defenseRating: formData.defenseRating,
      speedRating: formData.speedRating,
      driverSkill: formData.driverSkill,
      reliability: formData.reliability,
    };

    // Save to Firebase if configured, otherwise use local storage
    if (isFirebaseConfigured()) {
      await addScoutingEntry(entryData);
    } else {
      const entry: ScoutingEntry = {
        id: Date.now().toString(),
        ...entryData,
      };
      saveScoutingEntry(entry);
    }
    
    navigate('/dashboard');
  };

  const liveScores = calculateScores({
    auto: formData.auto,
    teleop: formData.teleop,
    endgame: formData.endgame,
  });

  return (
    <div className="max-w-lg mx-auto pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 z-10 px-4 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-white" />
            <h1 className="text-xl font-bold text-white">New Entry</h1>
          </div>
          <div className="w-10" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
            <div className="text-xs text-white/80">Auto</div>
            <div className="text-lg font-bold text-white">{liveScores.autoScore}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
            <div className="text-xs text-white/80">Teleop</div>
            <div className="text-lg font-bold text-white">{liveScores.teleopScore}</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
            <div className="text-xs text-white/80">Endgame</div>
            <div className="text-lg font-bold text-white">{liveScores.endgameScore}</div>
          </div>
          <div className="bg-white/25 backdrop-blur-sm rounded-xl p-2">
            <div className="text-xs text-white/80 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" /> Total
            </div>
            <div className="text-lg font-bold text-white">{liveScores.totalScore}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-5 dark:text-white flex items-center gap-2">
            📋 Match Information
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Team Number *</label>
              <input type="text" required value={formData.teamNumber} onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value })} className="w-full px-4 py-3.5 text-lg border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="e.g., 12345" />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Match Number *</label>
              <input type="text" required value={formData.matchNumber} onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })} className="w-full px-4 py-3.5 text-lg border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all" placeholder="e.g., Q5" />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Alliance</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleAllianceChange('red')} className={`py-4 rounded-xl font-semibold text-lg transition-all ${formData.alliance === 'red' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>🔴 Red</button>
              <button type="button" onClick={() => handleAllianceChange('blue')} className={`py-4 rounded-xl font-semibold text-lg transition-all ${formData.alliance === 'blue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>🔵 Blue</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('auto')} className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">🤖 Autonomous Phase</h2>
            {expandedSections.auto ? <ChevronUp size={24} className="text-blue-700 dark:text-blue-300" /> : <ChevronDown size={24} className="text-blue-700 dark:text-blue-300" />}
          </button>
          {expandedSections.auto && (
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Starting Position</label>
                <div className="grid grid-cols-2 gap-3">
                  {formData.alliance === 'blue' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'blue-classifier' } })}
                        className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'blue-classifier'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        🔵 Against Classifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'blue-launch' } })}
                        className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'blue-launch'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        🔵 Launch Zone
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'red-classifier' } })}
                        className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'red-classifier'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        🔴 Against Classifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'red-launch' } })}
                        className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'red-launch'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        🔴 Launch Zone
                      </button>
                    </>
                  )}
                </div>
              </div>
              <Counter value={formData.auto.leaveRobots} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, leaveRobots: val } })} min={0} max={1000} label="Robots Leave Starting Area" points="3 pts each" />
              <Counter value={formData.auto.classifiedArtifacts} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, classifiedArtifacts: val } })} label="Artifacts Classified" points="3 pts each" />
              <Counter value={formData.auto.overflowArtifacts} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, overflowArtifacts: val } })} label="Artifacts in Overflow" points="1 pt each" />
              <Counter value={formData.auto.patternMatches} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, patternMatches: val } })} min={0} max={1000} label="Pattern Matches (MOTIF)" points="2 pts each" />
              <button type="button" onClick={() => setShowAutoPath(true)} className="w-full py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium flex items-center justify-center gap-2">
                <Pencil size={18} />Draw Auto Path
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('teleop')} className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">🎮 Tele-Op Phase</h2>
            {expandedSections.teleop ? <ChevronUp size={24} className="text-green-700 dark:text-green-300" /> : <ChevronDown size={24} className="text-green-700 dark:text-green-300" />}
          </button>
          {expandedSections.teleop && (
            <div className="p-5 space-y-5">
              <Counter value={formData.teleop.classifiedArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, classifiedArtifacts: val } })} label="Artifacts Classified" points="3 pts each" />
              <Counter value={formData.teleop.overflowArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, overflowArtifacts: val } })} label="Artifacts in Overflow" points="1 pt each" />
              <Counter value={formData.teleop.depotArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, depotArtifacts: val } })} label="Depot Artifacts (at end)" points="1 pt each" />
              <Counter value={formData.teleop.patternMatches} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, patternMatches: val } })} min={0} max={1000} label="Pattern Matches (MOTIF)" points="2 pts each" />
              <Counter value={formData.teleop.cyclesCompleted} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, cyclesCompleted: val } })} label="Cycles Completed" points="(efficiency tracking)" />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('endgame')} className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20">
            <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300">🏁 Endgame / Base Return</h2>
            {expandedSections.endgame ? <ChevronUp size={24} className="text-purple-700 dark:text-purple-300" /> : <ChevronDown size={24} className="text-purple-700 dark:text-purple-300" />}
          </button>
          {expandedSections.endgame && (
            <div className="p-5 space-y-5">
              <Counter value={formData.endgame.baseFullRobots} onChange={(val) => setFormData({ ...formData, endgame: { ...formData.endgame, baseFullRobots: val } })} min={0} max={1000} label="Robots Fully in Base" points="10 pts each (+10 bonus if both)" />
              <Counter value={formData.endgame.basePartialRobots} onChange={(val) => setFormData({ ...formData, endgame: { ...formData.endgame, basePartialRobots: val } })} min={0} max={1000} label="Robots Partially in Base" points="5 pts each" />
              {formData.endgame.baseFullRobots === 2 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4 text-center">
                  <span className="text-yellow-700 dark:text-yellow-300 font-semibold text-lg">🎉 +10 Bonus for Both Robots!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('ratings')} className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20">
            <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-300">⭐ Performance Ratings</h2>
            {expandedSections.ratings ? <ChevronUp size={24} className="text-orange-700 dark:text-orange-300" /> : <ChevronDown size={24} className="text-orange-700 dark:text-orange-300" />}
          </button>
          {expandedSections.ratings && (
            <div className="p-5 space-y-5">
              {[{ key: 'defenseRating', label: 'Defense' }, { key: 'speedRating', label: 'Speed' }, { key: 'driverSkill', label: 'Driver Skill' }, { key: 'reliability', label: 'Reliability' }].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between mb-3">
                    <label className="text-base font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <span className="text-base text-gray-500 dark:text-gray-400 font-medium">{formData[key as keyof typeof formData] as number}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button key={rating} type="button" onClick={() => setFormData({ ...formData, [key]: rating })} className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all ${(formData[key as keyof typeof formData] as number) >= rating ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{rating}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Notes</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full px-4 py-3 text-base border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Any observations, issues, or notable plays..." />
        </div>

        <button type="submit" className="w-full py-5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40">
          <Save size={28} />Save Entry
        </button>
      </form>

      {showAutoPath && (
        <AutoPathCanvas
          onSave={(pathData) => {
            setFormData({ ...formData, auto: { ...formData.auto, autoPath: pathData } });
            setShowAutoPath(false);
          }}
          onClose={() => setShowAutoPath(false)}
          initialPath={formData.auto.autoPath || undefined}
          alliance={formData.alliance}
          startPosition={formData.auto.startPosition}
        />
      )}
    </div>
  );
};

export default ScoutingForm;
