'use client';

import React from 'react';
import { Question } from '../../lib/types';
import { Image as ImageIcon, Music, Video } from 'lucide-react';

interface MediaDisplayProps {
  question: Question;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ question }) => {
  if (question.type === 'text') return null;

  const iconMap = {
    image: <ImageIcon className="w-20 h-20 text-white" />,
    audio: <Music className="w-20 h-20 text-white" />,
    video: <Video className="w-20 h-20 text-white" />
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-white rounded-xl p-8 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
      <div className="flex flex-col items-center">
        <div className="mb-4 animate-pulse">
          {iconMap[question.type]}
        </div>
        <div className="text-white text-center bg-black/50 px-6 py-3 rounded-lg border-2 border-white/50 backdrop-blur">
          <p className="text-lg font-mono font-bold">{question.mediaPath}</p>
        </div>
        <p className="text-gray-400 text-sm mt-3 uppercase tracking-wider">
          {question.type === 'image' && '📸 Obraz do wyświetlenia'}
          {question.type === 'audio' && '🎵 Plik audio do odtworzenia'}
          {question.type === 'video' && '🎬 Film do odtworzenia'}
        </p>
      </div>
    </div>
  );
};

export default MediaDisplay;
