'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Crown, Star, Sparkles } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  score?: number;
  eliminated?: boolean;
}

interface GameService {
  calculateFinalScore: (team: Team) => number;
}

const GameService = {
  calculateFinalScore: (team: Team) => team.score || 0
};

interface WinnerDisplayProps {
  winner: Team;
  teams: Team[];
  onNewGame?: () => void;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, teams, onNewGame }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const sortedTeams = [...teams].sort((a, b) =>
    GameService.calculateFinalScore(b) - GameService.calculateFinalScore(a)
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (index === 1) return 'from-gray-300 via-gray-400 to-gray-500';
    if (index === 2) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-gray-700 via-gray-800 to-gray-900';
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      {/* Efekt konfetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="text-yellow-300" size={20 + Math.random() * 20} />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Sekcja zwycięzcy */}
        <div className="mb-12 relative">
          {/* Tło z poświatą */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 blur-3xl animate-pulse"></div>
          
          <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-12 shadow-2xl border-8 border-yellow-300 overflow-hidden">
            {/* Promienie świetlne */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-white/50 to-transparent"
                  style={{
                    transform: `rotate(${i * 30}deg) translateX(-50%)`,
                    transformOrigin: 'top center'
                  }}
                ></div>
              ))}
            </div>

            <div className="relative text-center">
              {/* Korona animowana */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Crown className="w-32 h-32 text-white drop-shadow-2xl animate-bounce" strokeWidth={2.5} />
                  <div className="absolute -top-2 -right-2">
                    <Star className="w-12 h-12 text-yellow-200 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <Star className="w-10 h-10 text-yellow-200 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                  </div>
                </div>
              </div>

              <h2 className="text-7xl font-black text-white mb-4 uppercase tracking-wider drop-shadow-lg animate-pulse">
                ZWYCIĘZCA!
              </h2>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-4 border-white/50">
                <h3 className="text-6xl font-black text-white drop-shadow-lg">
                  {winner.name}
                </h3>
                {typeof winner.preFinalPoints === 'number' && (
                  <p className="text-xl font-semibold text-white/80 mt-2">
                    Punkty po rundzie 1: {winner.preFinalPoints}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-4xl font-bold text-white">
                <Trophy className="w-12 h-12 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="bg-white/20 backdrop-blur-sm px-8 py-3 rounded-xl border-4 border-white/50">
                  {GameService.calculateFinalScore(winner)} PUNKTÓW
                </span>
                <Trophy className="w-12 h-12 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Ranking końcowy */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl p-8 border-4 border-purple-500/50 shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <h4 className="text-4xl font-black text-white uppercase tracking-wider">
              🏆 Ranking Końcowy 🏆
            </h4>
            <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <div
                key={team.id}
                className={`relative bg-gradient-to-r ${getRankColor(index)} rounded-2xl p-6 border-4 ${
                  index === 0 ? 'border-yellow-300' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-orange-400' : 'border-gray-600'
                } shadow-xl transform transition-all hover:scale-102 ${
                  index === 0 ? 'animate-pulse' : ''
                }`}
              >
                {/* Poświata dla zwycięzcy */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-xl -z-10 rounded-2xl"></div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* Numer miejsca */}
                    <div className={`text-5xl font-black ${
                      index < 3 ? 'text-white' : 'text-gray-300'
                    } w-20 h-20 flex items-center justify-center rounded-xl ${
                      index === 0 ? 'bg-yellow-600/30' : index === 1 ? 'bg-gray-600/30' : index === 2 ? 'bg-orange-600/30' : 'bg-gray-800/30'
                    } border-4 ${
                      index === 0 ? 'border-yellow-300' : index === 1 ? 'border-gray-300' : index === 2 ? 'border-orange-300' : 'border-gray-600'
                    }`}>
                      {getMedalEmoji(index)}
                    </div>

                    {/* Nazwa drużyny */}
                    <div>
                      <span className={`text-3xl font-bold ${
                        index < 3 ? 'text-white' : 'text-gray-200'
                      } drop-shadow-lg`}>
                        {team.name}
                      </span>
                      {typeof team.preFinalPoints === 'number' && (
                        <p className="text-sm text-gray-100/80">
                          Runda 1: {team.preFinalPoints} pkt
                        </p>
                      )}
                      {index === 0 && (
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Punkty */}
                  <div className={`text-3xl font-black ${
                    index < 3 ? 'text-white' : 'text-gray-200'
                  } ${
                    index === 0 ? 'bg-yellow-600/40' : index === 1 ? 'bg-gray-600/40' : index === 2 ? 'bg-orange-600/40' : 'bg-gray-800/40'
                  } px-8 py-4 rounded-xl border-4 ${
                    index === 0 ? 'border-yellow-300' : index === 1 ? 'border-gray-300' : index === 2 ? 'border-orange-300' : 'border-gray-600'
                  } backdrop-blur-sm`}>
                    {GameService.calculateFinalScore(team)} pkt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Przycisk nowej gry */}
        {onNewGame && (
          <button
            onClick={onNewGame}
            className="mt-8 w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 border-4 border-green-400 text-white font-black py-6 px-8 rounded-2xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 active:scale-95 shadow-2xl text-3xl uppercase tracking-wider group"
          >
            <RotateCcw className="w-10 h-10 group-hover:rotate-180 transition-transform duration-500" />
            Zagraj Ponownie
            <RotateCcw className="w-10 h-10 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default WinnerDisplay;
