'use client';

import React from 'react';
import { Team } from '../../lib/types';
import { GameService } from '../../lib/gameService';
import { Trophy, RotateCcw } from 'lucide-react';

interface WinnerDisplayProps {
  winner: Team;
  teams: Team[];
  onNewGame?: () => void;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, teams, onNewGame }) => {
  const sortedTeams = [...teams].sort((a, b) => 
    GameService.calculateFinalScore(b) - GameService.calculateFinalScore(a)
  );

  return (
    <div className="text-center">
      <div className="mb-10 bg-gradient-to-br from-white via-gray-200 to-gray-300 border-8 border-gray-300 rounded-3xl p-12 shadow-[0_0_100px_rgba(255,255,255,0.8)]">
        <Trophy className="w-40 h-40 text-black mx-auto mb-6 animate-bounce" />
        <h2 className="text-6xl font-bold text-black mb-4 uppercase tracking-wider">ZWYCIĘZCA!</h2>
        <h3 className="text-5xl font-bold text-black mb-6 border-t-4 border-b-4 border-black py-6">{winner.name}</h3>
        <p className="text-3xl text-black font-bold">
          🎉 {GameService.calculateFinalScore(winner)} PUNKTÓW 🎉
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white rounded-2xl p-8 max-w-3xl mx-auto shadow-[0_0_60px_rgba(255,255,255,0.4)]">
        <h4 className="text-4xl font-bold text-white mb-6 border-b-4 border-white pb-4 uppercase">Ranking Końcowy</h4>
        <div className="space-y-4">
          {sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`bg-gradient-to-r ${index === 0 ? 'from-white to-gray-200' : 'from-gray-700 to-gray-800'} border-4 ${index === 0 ? 'border-white' : 'border-gray-600'} rounded-xl p-5 flex justify-between items-center shadow-lg`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-3xl font-bold ${index === 0 ? 'text-black' : 'text-white'} bg-black/20 w-16 h-16 flex items-center justify-center rounded-xl`}>
                  #{index + 1}
                </span>
                <span className={`text-2xl font-bold ${index === 0 ? 'text-black' : 'text-white'}`}>{team.name}</span>
              </div>
              <span className={`text-2xl font-bold ${index === 0 ? 'text-black bg-black/20' : 'text-white bg-white/10'} px-6 py-2 rounded-xl border-2 ${index === 0 ? 'border-black' : 'border-white'}`}>
                {GameService.calculateFinalScore(team)} pkt
              </span>
            </div>
          ))}
        </div>
      </div>

      {onNewGame && (
        <button
          onClick={onNewGame}
          className="mt-8 w-full max-w-md mx-auto bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 border-4 border-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(150,150,150,0.4)] text-2xl uppercase tracking-wider"
        >
          <RotateCcw className="w-8 h-8" />
          Nowa Gra
        </button>
      )}
    </div>
  );
};

export default WinnerDisplay;