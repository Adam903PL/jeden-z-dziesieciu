'use client';

import React, { useMemo, useState } from 'react';
import { Team } from '../../lib/types';
import { Trophy, Target, PlusCircle, MinusCircle, Trash2, RefreshCcw } from 'lucide-react';

interface TeamManagementPanelProps {
  teams: Team[];
  activeTeamId: number | null;
  onSelectTeam: (teamId: number) => void;
  onAdjustPoints: (teamId: number, delta: number) => void;
  onRemoveTeam: (teamId: number) => void;
  onReviveTeam: (teamId: number) => void;
}

const TeamManagementPanel: React.FC<TeamManagementPanelProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onAdjustPoints,
  onRemoveTeam,
  onReviveTeam,
}) => {
  const [adjustValues, setAdjustValues] = useState<Record<number, string>>({});

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.points - a.points);
  }, [teams]);

  const handleValueChange = (teamId: number, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setAdjustValues(prev => ({
        ...prev,
        [teamId]: value,
      }));
    }
  };

  const resolveAdjustValue = (teamId: number): number | null => {
    const raw = adjustValues[teamId];
    if (raw === undefined || raw === '') {
      return 5;
    }

    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  };

  const applyAdjustment = (teamId: number, direction: 1 | -1) => {
    const value = resolveAdjustValue(teamId);
    if (!value) {
      return;
    }

    onAdjustPoints(teamId, value * direction);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-white">
        <Trophy className="w-6 h-6 text-white" />
        <h4 className="text-white font-bold text-xl uppercase">Zarządzanie Drużynami</h4>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        Rezerwowy panel prowadzącego: zarządzaj punktami, ustawiaj aktywną drużynę, usuwaj lub przywracaj uczestników, gdy trzeba ręcznie naprawić przebieg gry.
      </p>

      <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {sortedTeams.map(team => {
          const effectiveValue = resolveAdjustValue(team.id);
          const inputValue = adjustValues[team.id] ?? '';
          const isValueValid = effectiveValue !== null;

          return (
            <div
              key={team.id}
              className="bg-black/40 border border-gray-700 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-bold text-lg">{team.name}</p>
                  <p className="text-xs text-gray-400">
                    Punkty: <span className="text-white font-semibold">{team.points}</span> • Szanse: <span className="text-white font-semibold">{team.chances}</span>
                    {team.eliminated ? ' • Wyeliminowana' : ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      team.eliminated
                        ? 'bg-red-600 text-white'
                        : 'bg-green-500 text-black'
                    }`}
                  >
                    {team.points} pkt
                  </span>
                  {team.id === activeTeamId && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black">
                      Aktywna
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={inputValue}
                    onChange={event => handleValueChange(team.id, event.target.value)}
                    placeholder="5"
                    className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyAdjustment(team.id, 1)}
                    disabled={!isValueValid}
                    className={`flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${
                      isValueValid
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 text-black hover:from-emerald-600 hover:to-emerald-700'
                        : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Dodaj
                  </button>
                  <button
                    onClick={() => applyAdjustment(team.id, -1)}
                    disabled={!isValueValid}
                    className={`flex items-center justify-center gap-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${
                      isValueValid
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white hover:from-red-700 hover:to-red-800'
                        : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    Odejmij
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectTeam(team.id)}
                  disabled={team.eliminated}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${
                    team.eliminated
                      ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-white to-gray-200 border-gray-300 text-black hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Ustaw
                </button>

                <button
                  onClick={() => onRemoveTeam(team.id)}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-700 bg-gray-800 px-3 py-2 text-sm font-bold text-white transition-all hover:border-red-400 hover:bg-red-600/80 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Usuń
                </button>

                {team.eliminated ? (
                  <button
                    onClick={() => onReviveTeam(team.id)}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-green-500 bg-green-500/20 px-3 py-2 text-sm font-bold text-green-300 transition-all hover:bg-green-500/30"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Przywróć
                  </button>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            </div>
          );
        })}

        {sortedTeams.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4">
            Brak drużyn na liście.
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamManagementPanel;
