'use client';

import React from 'react';
import { GameStage } from '../../lib/types';
import { GameService } from '../../lib/gameService';

interface StageHeaderProps {
  stage: GameStage;
  questionCount?: number;
}

const StageHeader: React.FC<StageHeaderProps> = ({ stage, questionCount }) => {
  const stageNames: Record<GameStage, string> = {
    'setup': 'KONFIGURACJA',
    'stage1': 'ETAP I - ROZPOCZĘCIE',
    'stage2': 'ETAP II - WSKAZYWANIE',
    'stage3-part1': 'FINAŁ - CZĘŚĆ I',
    'stage3-part2': 'FINAŁ - CZĘŚĆ II',
    'finished': 'GRA ZAKOŃCZONA'
  };

  return (
    <div className="bg-gradient-to-r from-white via-gray-200 to-white text-black rounded-2xl p-8 mb-8 shadow-[0_0_60px_rgba(255,255,255,0.5)] border-4 border-gray-300">
      <h2 className="text-5xl font-bold text-center mb-2 uppercase tracking-wider">
        {stageNames[stage]}
      </h2>
      {questionCount !== undefined && stage.includes('stage3') && (
        <p className="text-center text-2xl font-bold">
          Pytanie {questionCount + 1} / {GameService.STAGE3_MAX_QUESTIONS}
        </p>
      )}
    </div>
  );
};

export default StageHeader;