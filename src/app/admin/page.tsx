'use client';

import React, { useState, useEffect } from 'react';
import { Team, GameStage } from '../lib';
import { AdminPanel } from '../components/game';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [stage, setStage] = useState<GameStage>('setup');
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);

  // Załadowanie stanu gry z localStorage przy pierwszym renderowaniu
  useEffect(() => {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
      try {
        const parsedState = JSON.parse(savedGameState);
        setTeams(parsedState.teams || []);
        setStage(parsedState.stage || 'setup');
      } catch (e) {
        console.error('Błąd podczas ładowania stanu gry:', e);
      }
    }
  }, []);

  // Zapisywanie stanu gry do localStorage przy każdej zmianie
  useEffect(() => {
    if (stage !== 'finished') {
      let persistedState: Record<string, unknown> = {};
      const existing = localStorage.getItem('gameState');
      if (existing) {
        try {
          persistedState = JSON.parse(existing);
        } catch {
          persistedState = {};
        }
      }
      const gameState = {
        ...persistedState,
        teams,
        stage,
      };
      localStorage.setItem('gameState', JSON.stringify(gameState));
    }
  }, [teams, stage]);

  const handleSetActiveTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.eliminated) return;
    setActiveTeamId(teamId);
  };

  const handleAddPoints = (teamId: number, points: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, points: t.points + points } : t
    ));
  };

  const handleRemovePoints = (teamId: number, points: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, points: Math.max(0, t.points - points) } : t
    ));
  };

  const handleAddChance = (teamId: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, chances: t.chances + 1 } : t
    ));
  };

  const handleRemoveChance = (teamId: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, chances: Math.max(0, t.chances - 1) } : t
    ));
  };

  const handleEliminateTeam = (teamId: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, eliminated: true } : t
    ));
  };

  const handleRestoreTeam = (teamId: number) => {
    setTeams(teams.map(t => 
      t.id === teamId ? { ...t, eliminated: false } : t
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffffff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e5e7eb;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all border-2 border-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Powrót do gry
          </Link>
          
          <h1 className="text-4xl font-bold text-white text-center flex-1">
            Panel Administracyjny
          </h1>
          
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>

        {teams.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-12 shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Brak aktywnej gry</h2>
            <p className="text-gray-300 text-xl mb-8">
              Rozpocznij nową grę na stronie głównej, aby uzyskać dostęp do panelu administracyjnego.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl transition-all border-2 border-blue-500 text-lg"
            >
              Przejdź do strony głównej
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
            <AdminPanel
              teams={teams}
              stage={stage}
              activeTeamId={activeTeamId}
              onSetActiveTeam={handleSetActiveTeam}
              onAddPoints={handleAddPoints}
              onRemovePoints={handleRemovePoints}
              onAddChance={handleAddChance}
              onRemoveChance={handleRemoveChance}
              onEliminateTeam={handleEliminateTeam}
              onRestoreTeam={handleRestoreTeam}
            />
          </div>
        )}
      </div>
    </div>
  );
}
