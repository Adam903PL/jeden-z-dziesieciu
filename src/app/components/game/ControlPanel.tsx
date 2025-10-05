'use client';

import React from 'react';
import { Team, GameStage, Question } from '../../lib/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface ControlPanelProps {
  teams: Team[];
  activeTeamId: number | null;
  stage: GameStage;
  currentQuestion: Question | null;
  showAnswer: boolean;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
  onSelectTeam: (teamId: number) => void;
  onNextStage: () => void;
  onAddPoints: (teamId: number, points: number) => void;
  onNewQuestion: () => void;
  onToggleAnswer: () => void;
  onFinishGame?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  teams, 
  activeTeamId, 
  stage, 
  currentQuestion, 
  showAnswer, 
  onCorrectAnswer, 
  onWrongAnswer, 
  onSelectTeam, 
  onNextStage, 
  onAddPoints, 
  onNewQuestion, 
  onToggleAnswer,
  onFinishGame
}) => {
  const activeTeams = teams.filter(t => !t.eliminated);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-3xl font-bold text-white mb-6 border-b-4 border-white pb-3 uppercase tracking-wider">
        Panel Sterowania
      </h3>

      {stage !== 'finished' && (
        <>
          <div className="mb-6 space-y-3">
            <button
              onClick={onNewQuestion}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 border-4 border-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(150,150,150,0.4)] text-lg uppercase"
            >
              🎲 Losuj Nowe Pytanie
            </button>
            
            {currentQuestion && (
              <button
                onClick={onToggleAnswer}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 border-4 border-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(150,150,150,0.4)] uppercase"
              >
                {showAnswer ? '👁️ Ukryj' : '👁️ Pokaż'} Odpowiedź
              </button>
            )}
          </div>

          <div className="mb-6">
            <p className="text-white font-bold mb-3 text-lg uppercase">Wybierz drużynę:</p>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
              {activeTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => onSelectTeam(team.id)}
                  className={`px-5 py-3 rounded-xl border-3 font-bold transition-all text-lg ${
                    activeTeamId === team.id
                      ? 'bg-gradient-to-r from-white to-gray-200 text-black border-gray-300 shadow-[0_0_25px_rgba(255,255,255,0.5)]'
                      : 'bg-gray-900 text-white border-gray-700 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          {activeTeamId && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={onCorrectAnswer}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 border-4 border-green-400 text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] text-lg"
              >
                <CheckCircle className="w-6 h-6" />
                POPRAWNA
              </button>
              <button
                onClick={onWrongAnswer}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 border-4 border-red-400 text-white font-bold py-5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] text-lg"
              >
                <XCircle className="w-6 h-6" />
                BŁĘDNA
              </button>
            </div>
          )}

          {(stage === 'stage3-part1' || stage === 'stage3-part2') && activeTeamId && (
            <div className="mb-6 p-5 bg-black/40 border-2 border-gray-700 rounded-xl backdrop-blur">
              <p className="text-white font-bold mb-3 text-sm uppercase">Dodaj punkty:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onAddPoints(activeTeamId, 10)}
                  className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all border-2 border-gray-400"
                >
                  +10 pkt
                </button>
                <button
                  onClick={() => onAddPoints(activeTeamId, 20)}
                  className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all border-2 border-gray-400"
                >
                  +20 pkt
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Przycisk Zakończ grę - dostępny w każdym etapie oprócz setup i finished */}
      {onFinishGame && (
        <button
          onClick={onFinishGame}
          className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-4 border-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] text-lg uppercase mb-4"
        >
          ⏹️ Zakończ Grę
        </button>
      )}

      {stage === 'stage1' && activeTeams.length <= 10 && (
        <button
          onClick={onNextStage}
          className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-gray-300 border-4 border-gray-300 text-black font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.5)] text-lg uppercase"
        >
          ➡️ Przejdź do Etapu II
        </button>
      )}

      {stage === 'stage2' && activeTeams.length <= 3 && (
        <button
          onClick={onNextStage}
          className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-gray-300 border-4 border-gray-300 text-black font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.5)] text-lg uppercase"
        >
          🏆 Przejdź do Finału
        </button>
      )}
    </div>
  );
};

export default ControlPanel;