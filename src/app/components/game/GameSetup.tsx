'use client';

import React, { useState, useEffect } from 'react';
import { Team } from '../../lib/types';
import { GameService } from '../../lib/gameService';
import { Play, Settings } from 'lucide-react';

interface GameSetupProps {
  onStart: (teams: Team[]) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [teamCount, setTeamCount] = useState(5);
  const [membersPerTeam, setMembersPerTeam] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  useEffect(() => {
    const names = Array(teamCount).fill('').map((_, i) => `Drużyna ${i + 1}`);
    setTeamNames(names);
  }, [teamCount]);

  const handleStart = () => {
    const teams: Team[] = teamNames.map((name, i) => ({
      id: i + 1,
      name: name || `Drużyna ${i + 1}`,
      chances: GameService.STAGE1_CHANCES,
      points: 0,
      eliminated: false,
      members: membersPerTeam
    }));
    onStart(teams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-gray-800 to-black border-4 border-white rounded-2xl p-10 max-w-2xl w-full shadow-[0_0_80px_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-white">
          <Settings className="w-10 h-10 text-white" />
          <h1 className="text-5xl font-bold text-white">KONFIGURACJA</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Liczba drużyn (2-10):
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={teamCount}
              onChange={(e) => setTeamCount(Math.min(10, Math.max(2, parseInt(e.target.value) || 2)))}
              className="w-full px-6 py-4 bg-black border-4 border-white rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-gray-300 focus:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
            />
          </div>

          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Liczba osób w drużynie:
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={membersPerTeam}
              onChange={(e) => setMembersPerTeam(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-6 py-4 bg-black border-4 border-white rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-gray-300 focus:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
            />
          </div>

          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Nazwy drużyn:
            </label>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {teamNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...teamNames];
                    newNames[i] = e.target.value;
                    setTeamNames(newNames);
                  }}
                  placeholder={`Drużyna ${i + 1}`}
                  className="w-full px-6 py-3 bg-black border-3 border-gray-600 hover:border-white rounded-xl text-white text-lg font-bold focus:outline-none focus:border-white focus:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-gray-300 text-black font-bold py-6 px-8 rounded-xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.5)] text-2xl uppercase tracking-wider"
          >
            <Play className="w-8 h-8" />
            Rozpocznij Grę
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;