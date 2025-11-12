'use client';

import React, { useState, useEffect } from 'react';
import { Play, Settings, ListChecks } from 'lucide-react';
import { Team, GameConfig } from '../../lib';

interface GameSetupProps {
  onStart: (teams: Team[], config: GameConfig) => void;
}

const DEFAULT_STAGE1_LIMIT = 30;
const DEFAULT_FINAL_LIMIT = 15;

const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [teamCount, setTeamCount] = useState(5);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<number[]>([]);
  const [stage1QuestionLimit, setStage1QuestionLimit] = useState(DEFAULT_STAGE1_LIMIT);
  const [finalQuestionLimit, setFinalQuestionLimit] = useState(DEFAULT_FINAL_LIMIT);

  useEffect(() => {
    setTeamNames((prev) =>
      Array.from({ length: teamCount }, (_, i) => prev[i] ?? `Druzyna ${i + 1}`)
    );
    setTeamMembers((prev) =>
      Array.from({ length: teamCount }, (_, i) => prev[i] ?? 2)
    );
  }, [teamCount]);

  const handleStart = () => {
    const teams = teamNames.map((name, i) => ({
      id: i + 1,
      name: name || `Druzyna ${i + 1}`,
      chances: 3,
      points: 0,
      eliminated: false,
      members: Math.max(1, teamMembers[i] ?? 1),
    }));

    const config: GameConfig = {
      stage1QuestionLimit: Math.max(1, stage1QuestionLimit || DEFAULT_STAGE1_LIMIT),
      finalQuestionLimit: Math.max(1, finalQuestionLimit || DEFAULT_FINAL_LIMIT),
    };

    onStart(teams, config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-gray-800 to-black border-4 border-white rounded-2xl p-10 max-w-3xl w-full min-h-[760px] shadow-[0_0_80px_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-4 border-white">
          <Settings className="w-10 h-10 text-white" />
          <h1 className="text-5xl font-bold text-white">Konfiguracja</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Liczba druzyn (2-10):
            </label>
            <div className="flex items-center justify-center gap-4 bg-black border-4 border-white rounded-xl px-6 py-4">
              <button
                type="button"
                onClick={() => setTeamCount((prev) => Math.max(2, prev - 1))}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-2xl"
              >
                -
              </button>
              <span className="w-16 text-center text-white text-3xl font-bold">
                {teamCount}
              </span>
              <button
                type="button"
                onClick={() => setTeamCount((prev) => Math.min(10, prev + 1))}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-2xl"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-xl font-bold mb-3 uppercase tracking-wide">
              Sklad druzyn:
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
                    onChange={(event) => {
                      setTeamNames((prev) => {
                        const updated = [...prev];
                        updated[i] = event.target.value;
                        return updated;
                      });
                    }}
                    placeholder={`Druzyna ${i + 1}`}
                    className="flex-1 px-4 py-2 bg-black border-2 border-gray-600 hover:border-white rounded-lg text-white text-lg font-bold focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all"
                  />
                  <div className="flex items-center gap-3 bg-black border-2 border-gray-600 rounded-xl px-4 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers((prev) => {
                          const updated = [...prev];
                          updated[i] = Math.max(1, (prev[i] ?? 1) - 1);
                          return updated;
                        });
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-xl"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-white text-xl font-bold">
                      {teamMembers[i] ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMembers((prev) => {
                          const updated = [...prev];
                          updated[i] = Math.min(10, (prev[i] ?? 1) + 1);
                          return updated;
                        });
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-white hover:text-black text-white font-bold rounded-lg transition-all text-xl"
                    >
                      +
                    </button>
                    <span className="text-gray-400 text-sm font-semibold ml-1">osob</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border-2 border-gray-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-6 h-6 text-white" />
              <h3 className="text-white font-bold text-xl uppercase">Limity pytan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2 uppercase font-semibold">
                  Etap I (kolo fortuny)
                </label>
                <input
                  type="number"
                  min={1}
                  value={stage1QuestionLimit}
                  onChange={(event) => setStage1QuestionLimit(Number(event.target.value))}
                  className="w-full px-4 py-3 bg-black border-2 border-gray-600 rounded-xl text-white font-bold focus:border-white focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Po tylu pytaniach automatycznie wybierzemy 2 najlepsze druzyny
                  albo szybciej, jesli w grze zostana tylko dwie.
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 uppercase font-semibold">
                  Final (ostatnia runda)
                </label>
                <input
                  type="number"
                  min={1}
                  value={finalQuestionLimit}
                  onChange={(event) => setFinalQuestionLimit(Number(event.target.value))}
                  className="w-full px-4 py-3 bg-black border-2 border-gray-600 rounded-xl text-white font-bold focus:border-white focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Po tej liczbie pytan wygrywa druzyna z wieksza liczba punktow lub ta,
                  ktora jako jedyna zachowa zycia.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-gray-300 text-black font-bold py-6 px-8 rounded-xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.5)] text-2xl uppercase tracking-wider"
          >
            <Play className="w-8 h-8" />
            Rozpocznij gre
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
