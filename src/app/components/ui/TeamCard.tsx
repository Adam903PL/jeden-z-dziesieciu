'use client';

import React from 'react';
import { Team, GameStage } from '../../lib/types';
import { XCircle, Zap } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  isActive?: boolean;
  stage: GameStage;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isActive, stage }) => {
  const isFinalStage = stage === 'stage3-part1' || stage === 'stage3-part2' || stage === 'finished';
  const pointsClassName = isFinalStage
    ? 'bg-gradient-to-r from-white to-gray-200 text-black'
    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black';

  return (
    <div className={`
      bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-3 transition-all transform
      ${isActive 
        ? 'border-white shadow-[0_0_40px_rgba(255,255,255,0.6)] scale-105 border-4' 
        : 'border-gray-700 hover:border-gray-300'
      }
      ${team.eliminated ? 'opacity-30 grayscale' : 'hover:scale-102'}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white truncate mb-1">{team.name}</h3>
          <p className="text-sm text-gray-400 font-semibold">#{team.id} • {team.members} osoby</p>
        </div>
        {team.eliminated ? (
          <div className="bg-red-600 rounded-full p-2">
            <XCircle className="w-6 h-6 text-white" />
          </div>
        ) : isActive && (
          <div className="bg-white rounded-full p-2 animate-pulse">
            <Zap className="w-6 h-6 text-black" />
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {Array(3).fill(0).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-4 rounded-full border-2 transition-all ${
              i < team.chances 
                ? 'bg-gradient-to-r from-green-500 to-green-400 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                : 'bg-gray-700 border-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between items-center border-t-2 border-gray-700 pt-3">
        <div className="text-gray-300 text-sm font-bold">
          Szanse: <span className="text-white text-lg">{team.chances}</span>
        </div>
        <div className={`${pointsClassName} font-bold text-xl px-4 py-1 rounded-full shadow-lg`}>
          {team.points} pkt
        </div>
      </div>
    </div>
  );
};

export default TeamCard;