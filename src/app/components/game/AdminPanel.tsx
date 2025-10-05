'use client';

import React, { useState } from 'react';
import { Team, GameStage } from '../../lib/types';
import { User, Plus, Minus, Heart, X, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  teams: Team[];
  stage: GameStage;
  activeTeamId: number | null;
  onSetActiveTeam: (teamId: number) => void;
  onAddPoints: (teamId: number, points: number) => void;
  onRemovePoints: (teamId: number, points: number) => void;
  onAddChance: (teamId: number) => void;
  onRemoveChance: (teamId: number) => void;
  onEliminateTeam: (teamId: number) => void;
  onRestoreTeam: (teamId: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  teams,
  stage,
  activeTeamId,
  onSetActiveTeam,
  onAddPoints,
  onRemovePoints,
  onAddChance,
  onRemoveChance,
  onEliminateTeam,
  onRestoreTeam
}) => {
  const [pointsInput, setPointsInput] = useState<Record<number, string>>({});
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  const handlePointsChange = (teamId: number, value: string) => {
    setPointsInput(prev => ({ ...prev, [teamId]: value }));
  };

  const handleAddPointsSubmit = (teamId: number) => {
    const points = parseInt(pointsInput[teamId] || '0');
    if (!isNaN(points) && points > 0) {
      onAddPoints(teamId, points);
      setPointsInput(prev => ({ ...prev, [teamId]: '' }));
    }
  };

  const handleRemovePointsSubmit = (teamId: number) => {
    const points = parseInt(pointsInput[teamId] || '0');
    if (!isNaN(points) && points > 0) {
      onRemovePoints(teamId, points);
      setPointsInput(prev => ({ ...prev, [teamId]: '' }));
    }
  };

  const toggleTeamExpansion = (teamId: number) => {
    setExpandedTeamId(prev => prev === teamId ? null : teamId);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-3xl font-bold text-white mb-6 border-b-4 border-white pb-3 uppercase tracking-wider">
        🛠️ Panel Administracyjny
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {teams.map(team => (
          <div 
            key={team.id} 
            className={`bg-gray-700/50 rounded-xl border-2 transition-all ${
              activeTeamId === team.id 
                ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                : 'border-gray-600'
            }`}
          >
            <div 
              className="p-4 cursor-pointer flex justify-between items-center"
              onClick={() => toggleTeamExpansion(team.id)}
            >
              <div className="flex items-center gap-3">
                <User className={`w-6 h-6 ${activeTeamId === team.id ? 'text-yellow-400' : 'text-white'}`} />
                <div>
                  <h4 className="font-bold text-white">{team.name}</h4>
                  <p className="text-sm text-gray-300">#{team.id} • {team.members} osoby</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-white">{team.points} pkt</p>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-white">{team.chances}</span>
                </div>
              </div>
            </div>

            {expandedTeamId === team.id && (
              <div className="p-4 border-t-2 border-gray-600 bg-gray-800/50 rounded-b-xl">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => onSetActiveTeam(team.id)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      activeTeamId === team.id
                        ? 'bg-yellow-500 text-black'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {activeTeamId === team.id ? '✅ Aktywna' : 'Wybierz'}
                  </button>
                  <button
                    onClick={() => onAddChance(team.id)}
                    className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    <span>+1 Szansa</span>
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={pointsInput[team.id] || ''}
                      onChange={(e) => handlePointsChange(team.id, e.target.value)}
                      placeholder="Punkty"
                      className="flex-1 px-3 py-2 bg-black border-2 border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddPointsSubmit(team.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemovePointsSubmit(team.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {team.eliminated ? (
                    <button
                      onClick={() => onRestoreTeam(team.id)}
                      className="py-2 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Przywróć</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onEliminateTeam(team.id)}
                      className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Eliminuj</span>
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveChance(team.id)}
                    className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    <span>-1 Szansa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-black/30 rounded-xl">
        <h4 className="font-bold text-white mb-2">Legenda:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Kliknij na drużynę, aby rozwinąć opcje administracyjne</li>
          <li>• Wybierz drużynę, aby ustawić ją jako aktywną</li>
          <li>• Dodawaj/odejmuj punkty i szanse według potrzeb</li>
          <li>• Eliminuj/przywracaj drużyny w razie potrzeby</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;