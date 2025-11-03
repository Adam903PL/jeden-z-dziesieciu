'use client';

import React, { useState, useEffect } from 'react';
import { Play, Settings } from 'lucide-react';

const GameSetup = ({ onStart }) => {
  const [teamCount, setTeamCount] = useState(5);
  const [teamNames, setTeamNames] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    setTeamNames(prev =>
      Array.from({ length: teamCount }, (_, i) => prev[i] ?? `Drużyna ${i + 1}`)
    );
    setTeamMembers(prev =>
      Array.from({ length: teamCount }, (_, i) => prev[i] ?? 2)
    );
  }, [teamCount]);

  const handleStart = () => {
    const teams = teamNames.map((name, i) => ({
      id: i + 1,
      name: name || `Drużyna ${i + 1}`,
      chances: 3,
      points: 0,
      eliminated: false,
      members: Math.max(1, teamMembers[i] ?? 1)
    }));
    onStart(teams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-gray-800 to-black border-4 border-white rounded-2xl p-10 max-w-2xl w-full min-h-[700px] shadow-[0_0_80px_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-white">
          <Settings className="w-10 h-10 text-white" />
          <h1 className="text-5xl font-bold text-white">KONFIGURACJA</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Liczba drużyn (2-10):
            </label>
            <div className="flex items-center justify-center gap-4 bg-black border-4 border-white rounded-xl px-6 py-4">
              <button
                type="button"
                onClick={() => setTeamCount(prev => Math.max(2, prev - 1))}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-2xl"
              >
                −
              </button>
              <span className="w-16 text-center text-white text-3xl font-bold">
                {teamCount}
              </span>
              <button
                type="button"
                onClick={() => setTeamCount(prev => Math.min(10, prev + 1))}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-2xl"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Skład drużyn:
            </label>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {teamNames.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-gray-700 hover:border-gray-500 rounded-xl p-4 transition-all"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setTeamNames(prev => {
                        const updated = [...prev];
                        updated[i] = e.target.value;
                        return updated;
                      });
                    }}
                    placeholder={`Drużyna ${i + 1}`}
                    className="flex-1 px-4 py-2 bg-black border-2 border-gray-600 hover:border-white rounded-lg text-white text-lg font-bold focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all"
                  />
                  <div className="flex items-center gap-3 bg-black border-2 border-gray-600 rounded-xl px-4 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers(prev => {
                          const updated = [...prev];
                          updated[i] = Math.max(1, (prev[i] ?? 1) - 1);
                          return updated;
                        });
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-xl"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-white text-xl font-bold">
                      {teamMembers[i] ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers(prev => {
                          const updated = [...prev];
                          updated[i] = Math.min(10, (prev[i] ?? 1) + 1);
                          return updated;
                        });
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-xl"
                    >
                      +
                    </button>
                    <span className="text-gray-400 text-sm font-semibold ml-1">osób</span>
                  </div>
                </div>
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