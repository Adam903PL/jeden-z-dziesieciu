'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Team } from '../../lib/types';
import { CheckCircle, XCircle, User, Users } from 'lucide-react';

interface AnswerPanelProps {
  activeTeam: Team;
  teams: Team[];
  questionId?: number;
  totalPointsThisTurn: number;
  onCorrectAnswer: (targetTeamId: number, multiplier: number) => void;
  onWrongAnswer: (pointsLost: number) => void;
  onCancel: () => void;
  onFinishGame?: () => void;
}

const AnswerPanel: React.FC<AnswerPanelProps> = ({ 
  activeTeam, 
  teams, 
  questionId,
  totalPointsThisTurn,
  onCorrectAnswer, 
  onWrongAnswer,
  onCancel,
  onFinishGame
}) => {
  const [answerStatus, setAnswerStatus] = useState<'pending' | 'correct' | 'wrong'>('pending');
  const [targetType, setTargetType] = useState<'self' | 'other' | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [selfAnswerCount, setSelfAnswerCount] = useState(0); // Track "on myself" answers in current turn

  const resetPanel = useCallback(() => {
    setAnswerStatus('pending');
    setTargetType(null);
    setSelectedTeamId(null);
    setMultiplier(1);
    setSelfAnswerCount(0);
  }, []);

  useEffect(() => {
    resetPanel();
  }, [resetPanel, activeTeam.id, questionId]);

  const handleAnswerStatus = (status: 'correct' | 'wrong') => {
    setAnswerStatus(status);
    if (status === 'wrong') {
      setTargetType(null);
      setSelectedTeamId(null);
      setMultiplier(1);
      setSelfAnswerCount(0); // Reset self answer count on wrong answer
    }
  };

  const handleTargetSelect = (type: 'self' | 'other') => {
    setTargetType(type);
    if (type === 'self') {
      setSelectedTeamId(activeTeam.id);
      // Calculate multiplier based on consecutive "on myself" answers
      // Multiplier: 2^count (1 -> 2, 2 -> 4, 3 -> 8, itd.)
      const newCount = selfAnswerCount + 1;
      setSelfAnswerCount(newCount);
      const calculatedMultiplier = Math.pow(2, newCount);
      setMultiplier(calculatedMultiplier);
    } else {
      setSelectedTeamId(null);
      setMultiplier(1);
      // Reset "on myself" count when choosing another team
      setSelfAnswerCount(0);
    }
  };

  const handleSubmit = () => {
    if (answerStatus === 'correct' && targetType) {
      const targetTeamId = targetType === 'self' ? activeTeam.id : selectedTeamId;
      if (targetTeamId) {
        onCorrectAnswer(targetTeamId, multiplier);
        // Only reset self answer count if we're not choosing "on myself" again
        if (targetType !== 'self') {
          setSelfAnswerCount(0);
        }
        resetPanel();
      }
    } else if (answerStatus === 'wrong') {
      // Traci wszystkie punkty zdobyte w tej turze
      // Only pass points to subtract if there are actually accumulated points
      onWrongAnswer(totalPointsThisTurn > 0 ? totalPointsThisTurn : 0);
      resetPanel();
    }
  };

  const handleCancel = () => {
    resetPanel();
    onCancel();
  };

  const activeTeams = teams.filter(t => !t.eliminated && t.id !== activeTeam.id);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
      <h3 className="text-3xl font-bold text-white mb-6 text-center uppercase tracking-wider">
        Panel Odpowiedzi
      </h3>

      {/* Wybrana drużyna */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-white text-center">
        <p className="text-xl font-bold">Aktualnie odpowiada:</p>
        <p className="text-2xl font-bold mt-2">{activeTeam.name}</p>
      </div>

      {/* Status odpowiedzi */}
      {answerStatus === 'pending' && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-white mb-4 text-center">Czy odpowiedź była poprawna?</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswerStatus('correct')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl text-white font-bold transition-all"
            >
              <CheckCircle className="w-8 h-8" />
              POPRAWNA
            </button>
            <button
              onClick={() => handleAnswerStatus('wrong')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl text-white font-bold transition-all"
            >
              <XCircle className="w-8 h-8" />
              BŁĘDNA
            </button>
          </div>
        </div>
      )}

      {/* Wybór celu dla poprawnej odpowiedzi */}
      {answerStatus === 'correct' && (
        <div className="mb-6">
          <h4 className="text-xl font-bold text-white mb-4 text-center">Na kogo kierujesz pytanie?</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleTargetSelect('self')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
                targetType === 'self'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                  : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white'
              }`}
            >
              <User className="w-8 h-8" />
              NA SIEBIE
            </button>
            <button
              onClick={() => handleTargetSelect('other')}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
                targetType === 'other'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white'
              }`}
            >
              <Users className="w-8 h-8" />
              NA INNĄ DRUŻYNĘ
            </button>
          </div>

          {/* Wybór drużyny, jeśli wybrano "na inną drużynę" */}
          {targetType === 'other' && (
            <div className="mb-4">
              <h5 className="text-lg font-bold text-white mb-3 text-center">Wybierz drużynę:</h5>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                {activeTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`px-4 py-2 rounded-lg text-center transition-all ${
                      selectedTeamId === team.id
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mnożnik punktów */}
          {targetType && (
            <div className="mb-4">
              <h5 className="text-lg font-bold text-white mb-3 text-center">Mnożnik punktów: x{multiplier}</h5>
              {targetType === 'self' && (
                <div className="text-center text-gray-300 text-sm">
                  Odpowiedzi "na siebie" w tej turze: {selfAnswerCount}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Potwierdzenie */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all"
        >
          Anuluj
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={
            answerStatus === 'pending' || 
            (answerStatus === 'correct' && targetType === 'other' && !selectedTeamId)
          }
          className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all ${
            answerStatus === 'pending' || 
            (answerStatus === 'correct' && targetType === 'other' && !selectedTeamId)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : answerStatus === 'correct'
                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white'
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white'
          }`}
        >
          {answerStatus === 'pending' ? 'Wybierz odpowiedź' : 
           answerStatus === 'correct' ? 'Potwierdź wybór' : 'Potwierdź błąd'}
        </button>
      </div>

      {/* Przycisk Zakończ grę */}
      {onFinishGame && (
        <button
          onClick={onFinishGame}
          className="mt-4 w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-4 border-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] text-lg uppercase"
        >
          ⏹️ Zakończ Grę
        </button>
      )}
    </div>
  );
};

export default AnswerPanel;