'use client';

import React from 'react';
import { Question } from '../../lib/types';
import { Zap } from 'lucide-react';
import MediaDisplay from './MediaDisplay';

interface QuestionDisplayProps {
  question: Question | null;
  showAnswer: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, showAnswer }) => {
  if (!question) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-gray-700 rounded-2xl p-12 mb-6 shadow-2xl text-center">
        <Zap className="w-24 h-24 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 text-2xl font-bold">Kliknij &quot;LOSUJ PYTANIE&quot;</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 border-white rounded-2xl p-8 mb-6 shadow-[0_0_50px_rgba(255,255,255,0.4)]">
      <div className="mb-6">
        <span className="bg-gradient-to-r from-white to-gray-200 text-black px-6 py-2 text-lg font-bold rounded-full shadow-lg inline-block">
          {question.category || 'PYTANIE'}
        </span>
      </div>
      
      <MediaDisplay question={question} />
      
      <div className="bg-black/40 border-l-4 border-white rounded-lg p-6 backdrop-blur">
        <h3 className="text-4xl font-bold text-white leading-tight">
          {question.question}
        </h3>
      </div>
      
      {showAnswer && (
        <div className="mt-6 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-xl border-4 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-pulse">
          <p className="text-sm font-bold mb-2 uppercase tracking-wider">✅ POPRAWNA ODPOWIEDŹ:</p>
          <p className="text-3xl font-bold">{question.answer}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;