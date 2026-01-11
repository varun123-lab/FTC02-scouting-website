import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScoutingEntry } from '../types';
import { calculateScores } from '../utils/scoring';
import { saveScoutingEntry } from '../utils/storage';
import { Save, ArrowLeft, Pencil, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs text-blue-600 dark:text-blue-400">{points}</span>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <Minus size={20} />
        </button>
        <span className="text-2xl font-bold w-12 text-center dark:text-white">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const scores = calculateScores({
      auto: formData.auto,
      teleop: formData.teleop,
      endgame: formData.endgame,
    });

    const entry: ScoutingEntry = {
      id: Date.now().toString(),
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

    saveScoutingEntry(entry);
    navigate('/dashboard');
  };

  const liveScores = calculateScores({
    auto: formData.auto,
    teleop: formData.teleop,
    endgame: formData.endgame,
  });

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={24} className="dark:text-white" />
          </button>
          <h1 className="text-xl font-bold dark:text-white">New Scout Entry</h1>
          <div className="w-10" />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
            <div className="text-xs text-blue-600 dark:text-blue-300">Auto</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-200">{liveScores.autoScore}</div>
          </div>
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
            <div className="text-xs text-green-600 dark:text-green-300">Teleop</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-200">{liveScores.teleopScore}</div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
            <div className="text-xs text-purple-600 dark:text-purple-300">Endgame</div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-200">{liveScores.endgameScore}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-xs text-gray-600 dark:text-gray-300">Total</div>
            <div className="text-lg font-bold text-gray-700 dark:text-gray-200">{liveScores.totalScore}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Match Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Number *</label>
              <input type="text" required value={formData.teamNumber} onChange={(e) => setFormData({ ...formData, teamNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., 12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Number *</label>
              <input type="text" required value={formData.matchNumber} onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" placeholder="e.g., Q5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alliance</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleAllianceChange('red')} className={`py-3 rounded-lg font-medium transition-colors ${formData.alliance === 'red' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Red Alliance</button>
              <button type="button" onClick={() => handleAllianceChange('blue')} className={`py-3 rounded-lg font-medium transition-colors ${formData.alliance === 'blue' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Blue Alliance</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('auto')} className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">🤖 Autonomous Phase</h2>
            {expandedSections.auto ? <ChevronUp size={20} className="text-blue-700 dark:text-blue-300" /> : <ChevronDown size={20} className="text-blue-700 dark:text-blue-300" />}
          </button>
          {expandedSections.auto && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Starting Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.alliance === 'blue' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'blue-classifier' } })}
                        className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'blue-classifier'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        🔵 Against Classifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, auto: { ...formData.auto, startPosition: 'blue-launch' } })}
                        className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'blue-launch'
                            ? 'bg-blue-500 text-white'
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
                        className={`py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          formData.auto.startPosition === 'red-classifier'
                            ? 'bg-red-500 text-white'
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
              <Counter value={formData.auto.leaveRobots} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, leaveRobots: val } })} min={0} max={2} label="Robots Leave Starting Area" points="3 pts each" />
              <Counter value={formData.auto.classifiedArtifacts} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, classifiedArtifacts: val } })} label="Artifacts Classified" points="3 pts each" />
              <Counter value={formData.auto.overflowArtifacts} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, overflowArtifacts: val } })} label="Artifacts in Overflow" points="1 pt each" />
              <Counter value={formData.auto.patternMatches} onChange={(val) => setFormData({ ...formData, auto: { ...formData.auto, patternMatches: val } })} min={0} max={9} label="Pattern Matches (MOTIF)" points="2 pts each" />
              <button type="button" onClick={() => setShowAutoPath(true)} className="w-full py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium flex items-center justify-center gap-2">
                <Pencil size={18} />Draw Auto Path
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('teleop')} className="w-full px-4 py-3 flex items-center justify-between bg-green-50 dark:bg-green-900/30">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">🎮 Tele-Op Phase</h2>
            {expandedSections.teleop ? <ChevronUp size={20} className="text-green-700 dark:text-green-300" /> : <ChevronDown size={20} className="text-green-700 dark:text-green-300" />}
          </button>
          {expandedSections.teleop && (
            <div className="p-4 space-y-4">
              <Counter value={formData.teleop.classifiedArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, classifiedArtifacts: val } })} label="Artifacts Classified" points="3 pts each" />
              <Counter value={formData.teleop.overflowArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, overflowArtifacts: val } })} label="Artifacts in Overflow" points="1 pt each" />
              <Counter value={formData.teleop.depotArtifacts} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, depotArtifacts: val } })} label="Depot Artifacts (at end)" points="1 pt each" />
              <Counter value={formData.teleop.patternMatches} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, patternMatches: val } })} min={0} max={9} label="Pattern Matches (MOTIF)" points="2 pts each" />
              <Counter value={formData.teleop.cyclesCompleted} onChange={(val) => setFormData({ ...formData, teleop: { ...formData.teleop, cyclesCompleted: val } })} label="Cycles Completed" points="(efficiency tracking)" />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('endgame')} className="w-full px-4 py-3 flex items-center justify-between bg-purple-50 dark:bg-purple-900/30">
            <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300">🏁 Endgame / Base Return</h2>
            {expandedSections.endgame ? <ChevronUp size={20} className="text-purple-700 dark:text-purple-300" /> : <ChevronDown size={20} className="text-purple-700 dark:text-purple-300" />}
          </button>
          {expandedSections.endgame && (
            <div className="p-4 space-y-4">
              <Counter value={formData.endgame.baseFullRobots} onChange={(val) => { const maxPartial = 2 - val; setFormData({ ...formData, endgame: { ...formData.endgame, baseFullRobots: val, basePartialRobots: Math.min(formData.endgame.basePartialRobots, maxPartial) } }); }} min={0} max={2} label="Robots Fully in Base" points="10 pts each (+10 bonus if both)" />
              <Counter value={formData.endgame.basePartialRobots} onChange={(val) => setFormData({ ...formData, endgame: { ...formData.endgame, basePartialRobots: val } })} min={0} max={2 - formData.endgame.baseFullRobots} label="Robots Partially in Base" points="5 pts each" />
              {formData.endgame.baseFullRobots === 2 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 text-center">
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">🎉 +10 Bonus for Both Robots Fully Returned!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button type="button" onClick={() => toggleSection('ratings')} className="w-full px-4 py-3 flex items-center justify-between bg-orange-50 dark:bg-orange-900/30">
            <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-300">⭐ Performance Ratings</h2>
            {expandedSections.ratings ? <ChevronUp size={20} className="text-orange-700 dark:text-orange-300" /> : <ChevronDown size={20} className="text-orange-700 dark:text-orange-300" />}
          </button>
          {expandedSections.ratings && (
            <div className="p-4 space-y-4">
              {[{ key: 'defenseRating', label: 'Defense' }, { key: 'speedRating', label: 'Speed' }, { key: 'driverSkill', label: 'Driver Skill' }, { key: 'reliability', label: 'Reliability' }].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formData[key as keyof typeof formData] as number}/5</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button key={rating} type="button" onClick={() => setFormData({ ...formData, [key]: rating })} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${(formData[key as keyof typeof formData] as number) >= rating ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{rating}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Any observations, issues, or notable plays..." />
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Save size={24} />Save Entry
        </button>
      </form>

      {showAutoPath && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Draw Auto Path</h3>
              <button onClick={() => setShowAutoPath(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">✕</button>
            </div>
            <div className="p-4">
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
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Path Notes</label>
                <textarea value={formData.auto.pathNotes} onChange={(e) => setFormData({ ...formData, auto: { ...formData.auto, pathNotes: e.target.value } })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Describe the auto path strategy..." />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutingForm;
