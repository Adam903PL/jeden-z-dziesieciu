'use client';

import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  eliminated?: boolean;
}

interface FortuneWheelProps {
  teams: Team[];
  onTeamSelected: (teamId: number) => void;
  onFinishGame?: () => void;
}

const FortuneWheel: React.FC<FortuneWheelProps> = ({ teams, onTeamSelected, onFinishGame }) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const activeTeams = teams.filter(t => !t.eliminated);

  const spinWheel = () => {
    if (activeTeams.length === 0 || spinning) return;

    setSpinning(true);
    setSelectedTeamId(null);

    const teamsSnapshot = [...activeTeams];
    const randomIndex = Math.floor(Math.random() * teamsSnapshot.length);
    const segmentAngle = 360 / teamsSnapshot.length;
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
    const desiredRotation = (360 - targetAngle) % 360;
    const fullSpins = 5 + Math.floor(Math.random() * 3);

    setRotation(prevRotation => {
      const normalizedPrev = ((prevRotation % 360) + 360) % 360;
      const extraRotation = fullSpins * 360 + desiredRotation - normalizedPrev;
      return prevRotation + extraRotation;
    });

    setTimeout(() => {
      const selectedTeam = teamsSnapshot[randomIndex];
      setSelectedTeamId(selectedTeam.id);
      setSpinning(false);

      setTimeout(() => {
        onTeamSelected(selectedTeam.id);
      }, 1000);
    }, 4000);
  };

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-yellow-400 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center uppercase tracking-wider">
        🎡 Koło Fortuny - Wybór drużyny
      </h3>
      
      <div className="flex flex-col items-center">
        {/* Koło fortuny */}
        <div className="relative mb-8">
          {/* Wskaźnik na górze */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-600"></div>
          </div>
          
          {/* Koło */}
          <div className="relative w-80 h-80">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-2xl"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.3, 0.99)' : 'none'
              }}
            >
              {/* Cień koła */}
              <circle cx="100" cy="100" r="98" fill="#1f2937" opacity="0.5" />
              
              {/* Segmenty */}
              {activeTeams.map((team, index) => {
                const segmentAngle = 360 / activeTeams.length;
                const startAngle = index * segmentAngle - 90;
                const endAngle = startAngle + segmentAngle;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 100 + 95 * Math.cos(startRad);
                const y1 = 100 + 95 * Math.sin(startRad);
                const x2 = 100 + 95 * Math.cos(endRad);
                const y2 = 100 + 95 * Math.sin(endRad);
                
                const largeArc = segmentAngle > 180 ? 1 : 0;
                
                const path = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;
                
                const midAngle = startAngle + segmentAngle / 2;
                const textX = 100 + 60 * Math.cos((midAngle * Math.PI) / 180);
                const textY = 100 + 60 * Math.sin((midAngle * Math.PI) / 180);
                
                const colorClass = colors[index % colors.length];
                const colorMap: { [key: string]: string } = {
                  'bg-red-500': '#ef4444',
                  'bg-blue-500': '#3b82f6',
                  'bg-green-500': '#22c55e',
                  'bg-yellow-500': '#eab308',
                  'bg-purple-500': '#a855f7',
                  'bg-pink-500': '#ec4899',
                  'bg-indigo-500': '#6366f1',
                  'bg-orange-500': '#f97316',
                };
                
                return (
                  <g key={team.id}>
                    <path
                      d={path}
                      fill={colorMap[colorClass]}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {team.name.length > 12 ? team.name.substring(0, 10) + '...' : team.name}
                    </text>
                  </g>
                );
              })}
              
              {/* Obramowanie koła */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="#fbbf24" strokeWidth="6" />
              
              {/* Środek koła */}
              <circle cx="100" cy="100" r="15" fill="#fbbf24" />
              <circle cx="100" cy="100" r="10" fill="#1f2937" />
            </svg>
          </div>
        </div>

        {/* Przycisk */}
        <button
          onClick={spinWheel}
          disabled={spinning || activeTeams.length === 0}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xl transition-all transform ${
            spinning || activeTeams.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-lg hover:scale-110 active:scale-95'
          }`}
        >
          <Play className="w-6 h-6" />
          {spinning ? 'Koło się kręci...' : 'ZAKRĘĆ KOŁEM!'}
        </button>

        {/* Wybrana drużyna */}
        {selectedTeamId && !spinning && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white text-center shadow-xl animate-pulse">
            <p className="text-2xl font-bold">
              🎉 {activeTeams.find(t => t.id === selectedTeamId)?.name} 🎉
            </p>
          </div>
        )}

        {/* Lista drużyn */}
        <div className="mt-8 w-full">
          <h4 className="text-xl font-bold text-yellow-400 mb-4 text-center">
            Aktywne drużyny ({activeTeams.length})
          </h4>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
            {activeTeams.map((team, index) => (
              <div
                key={team.id}
                className={`p-3 rounded-lg text-center font-semibold transition-all ${
                  selectedTeamId === team.id && !spinning
                    ? 'bg-yellow-400 text-black scale-105 shadow-lg'
                    : `${colors[index % colors.length]} text-white`
                }`}
              >
                {team.name}
              </div>
            ))}
          </div>
        </div>

        {/* Zakończ grę */}
        {onFinishGame && (
          <button
            onClick={onFinishGame}
            className="mt-8 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl text-lg uppercase hover:scale-105 active:scale-95"
          >
            ⏹️ Zakończ Grę
          </button>
        )}
      </div>
    </div>
  );
};

export default FortuneWheel;