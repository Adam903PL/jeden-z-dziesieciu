'use client';

import React, { useState, useEffect } from 'react';
import { Team } from '../../lib/types';
import { RotateCcw, Play } from 'lucide-react';

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
    
    // Losowy obrót koła (minimum 3 pełne obroty + losowy kąt)
    const spins = 3 + Math.random() * 2;
    const randomRotation = 360 * spins + Math.random() * 360;
    const newRotation = rotation + randomRotation;
    
    setRotation(newRotation);
    
    // Po zakończeniu animacji wybieramy drużynę
    setTimeout(() => {
      // Obliczamy indeks wybranej drużyny na podstawie końcowego obrotu
      const normalizedRotation = newRotation % 360;
      const segmentAngle = 360 / activeTeams.length;
      // Odwracamy kąt, ponieważ koło obraca się przeciwnie do ruchu wskazówek zegara
      const selectedIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % activeTeams.length;
      
      const selectedTeam = activeTeams[selectedIndex];
      setSelectedTeamId(selectedTeam.id);
      setSpinning(false);
      
      // Automatycznie przekazujemy wybraną drużynę po krótkim opóźnieniu
      setTimeout(() => {
        onTeamSelected(selectedTeam.id);
      }, 1000);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-yellow-400 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 text-center uppercase tracking-wider">
        🎡 Koło Fortuny - Wybór drużyny
      </h3>
      
      <div className="flex flex-col items-center">
        {/* Wizualizacja koła fortuny */}
        <div className="relative mb-8">
          <div 
            className={`w-64 h-64 rounded-full border-8 border-yellow-400 relative overflow-hidden transition-transform duration-3000 ease-out ${
              spinning ? 'animate-pulse' : ''
            }`}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none'
            }}
          >
            {activeTeams.map((team, index) => {
              const angle = (360 / activeTeams.length) * index;
              const isSelected = selectedTeamId === team.id;
              
              return (
                <div
                  key={team.id}
                  className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center ${
                    isSelected ? 'bg-yellow-400/30' : 'bg-gray-700/50'
                  }`}
                  style={{
                    transform: `rotate(${angle}deg) skewY(${90 - (360 / activeTeams.length)}deg)`,
                    transformOrigin: '0% 100%'
                  }}
                >
                  <span 
                    className={`text-xs font-bold text-center px-2 transform -rotate-${angle} ${
                      isSelected ? 'text-yellow-400' : 'text-white'
                    }`}
                    style={{ 
                      transform: `rotate(${-(angle + (360 / activeTeams.length) / 2)}deg)`,
                      width: '80px'
                    }}
                  >
                    {team.name}
                  </span>
                </div>
              );
            })}
            
            {/* Wskaźnik */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full z-10 flex items-center justify-center">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500 absolute -bottom-3"></div>
            </div>
          </div>
        </div>

        {/* Przycisk do kręcenia kołem */}
        <button
          onClick={spinWheel}
          disabled={spinning || activeTeams.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
            spinning || activeTeams.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg hover:scale-105'
          }`}
        >
          <Play className="w-5 h-5" />
          {spinning ? 'Koło się kręci...' : 'Zakręć kołem'}
        </button>

        {/* Wyświetlanie wybranej drużyny */}
        {selectedTeamId && !spinning && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-600 to-green-500 rounded-xl text-white text-center animate-pulse">
            <p className="text-xl font-bold">
              Wybrana drużyna: {activeTeams.find(t => t.id === selectedTeamId)?.name}
            </p>
          </div>
        )}

        {/* Lista aktywnych drużyn */}
        <div className="mt-6 w-full">
          <h4 className="text-xl font-bold text-white mb-3 text-center">Aktywne drużyny:</h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
            {activeTeams.map(team => (
              <div
                key={team.id}
                className={`p-2 rounded-lg text-center ${
                  selectedTeamId === team.id && !spinning
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {team.name}
              </div>
            ))}
          </div>
        </div>

        {/* Przycisk Zakończ grę */}
        {onFinishGame && (
          <button
            onClick={onFinishGame}
            className="mt-6 w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-4 border-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] text-lg uppercase"
          >
            ⏹️ Zakończ Grę
          </button>
        )}
      </div>
    </div>
  );
};

export default FortuneWheel;