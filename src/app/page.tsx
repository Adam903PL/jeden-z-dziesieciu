"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Team, GameStage, Question, GameConfig } from "./lib";
import { GameService } from "./lib";
import { loadQuestions } from "./data";
import { GameSetup } from "./components/game";
import { QuestionDisplay } from "./components/ui";
import { TeamCard } from "./components/ui";
import { StageHeader } from "./components/ui";
import { ControlPanel } from "./components/game";
import { WinnerDisplay } from "./components/game";
import { FortuneWheel } from "./components/game";
import { AnswerPanel } from "./components/game";

import { Users } from "lucide-react";

const DEFAULT_GAME_CONFIG: GameConfig = {
  stage1QuestionLimit: 30,
  finalQuestionLimit: GameService.STAGE3_MAX_QUESTIONS,
};

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [stage, setStage] = useState<GameStage>("setup");
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [stage1WrongAnswers, setStage1WrongAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stage1Phase, setStage1Phase] = useState<"wheel" | "question" | "answer">("wheel");
  const [pointsThisTurn, setPointsThisTurn] = useState(0);
  const [totalPointsThisTurn, setTotalPointsThisTurn] = useState(0);
  const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);
  const [stage1QuestionsResolved, setStage1QuestionsResolved] = useState(0);
  const [stage1SelfStreaks, setStage1SelfStreaks] = useState<Record<number, number>>({});

  const finalQuestionLimit =
    gameConfig?.finalQuestionLimit ?? GameService.STAGE3_MAX_QUESTIONS;

  const resetTurnPoints = () => {
    setPointsThisTurn(0);
    setTotalPointsThisTurn(0);
  };

  const applyPointsToTeam = (teamId: number, delta: number) => {
    if (!delta) return;
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId
          ? { ...team, points: Math.max(0, team.points + delta) }
          : team
      )
    );
  };

  const moveTeamsToFinal = useCallback(
    (aliveTeams: Team[]) => {
      if (stage !== "stage1" || aliveTeams.length === 0) return;

      const sortedByPoints = [...aliveTeams].sort((a, b) => {
        if (b.points === a.points) {
          return b.chances - a.chances;
        }
        return b.points - a.points;
      });

      if (sortedByPoints.length <= 1) {
        setStage("finished");
        setCurrentQuestion(null);
        setActiveTeamId(null);
        localStorage.removeItem("gameState");
        return;
      }

      let finalists = sortedByPoints.filter((team) => team.points > 0).slice(0, 2);
      if (finalists.length < 2) {
        finalists = sortedByPoints.slice(0, 2);
      }

      if (finalists.length <= 1) {
        setStage("finished");
        setCurrentQuestion(null);
        setActiveTeamId(null);
        localStorage.removeItem("gameState");
        return;
      }

      const finalistIds = new Set(finalists.map((team) => team.id));

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (!finalistIds.has(team.id)) {
            return { ...team, eliminated: true };
          }
          const lifeBonus = team.chances * GameService.POINTS_PER_CHANCE;
          return {
            ...team,
            preFinalPoints: team.points,
            points: lifeBonus,
            eliminated: false,
          };
        })
      );
      setStage("stage3-part1");
      setQuestionCount(0);
      setActiveTeamId(null);
      setCurrentQuestion(null);
      setShowAnswer(false);
      setStage1SelfStreaks({});
    },
    [stage]
  );

  // --- przejście do finału ---
  useEffect(() => {
    if (stage !== "stage1") return;
    const aliveTeams = teams.filter((team) => !team.eliminated);
    if (aliveTeams.length === 0) return;

    if (aliveTeams.length <= 2) {
      moveTeamsToFinal(aliveTeams);
      return;
    }

    if (stage1QuestionsResolved >= gameConfig.stage1QuestionLimit) {
      moveTeamsToFinal(aliveTeams);
    }
  }, [teams, stage, stage1QuestionsResolved, gameConfig.stage1QuestionLimit, moveTeamsToFinal]);

  // --- ładowanie stanu gry ---
  useEffect(() => {
    const savedGameState = localStorage.getItem("gameState");
    if (savedGameState) {
      try {
        const parsedState = JSON.parse(savedGameState);
        if (parsedState.stage !== "finished") {
          setTeams(parsedState.teams || []);
          setStage(parsedState.stage || "setup");
          setQuestionCount(parsedState.questionCount || 0);
          setStage1WrongAnswers(parsedState.stage1WrongAnswers || {});
          setUsedQuestionIds(parsedState.usedQuestionIds || []);
          setStage1QuestionsResolved(parsedState.stage1QuestionsResolved || 0);
          setGameConfig(parsedState.gameConfig || DEFAULT_GAME_CONFIG);
          setStage1SelfStreaks(parsedState.stage1SelfStreaks || {});
        }
      } catch (e) {
        console.error("Błąd podczas ładowania stanu gry:", e);
      }
    }
  }, []);

  // --- zapisywanie stanu gry ---
  useEffect(() => {
    if (stage !== "finished") {
      const gameState = {
        teams,
        stage,
        questionCount,
        stage1WrongAnswers,
        usedQuestionIds,
        stage1QuestionsResolved,
        stage1SelfStreaks,
        gameConfig,
      };
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }
  }, [teams, stage, questionCount, stage1WrongAnswers, usedQuestionIds]);

  // --- start gry ---
  const handleGameStart = (initialTeams: Team[], config: GameConfig) => {
    setTeams(initialTeams);
    setGameConfig(config);
    setStage("stage1");

    const wrongAnswers: Record<number, number> = {};
    initialTeams.forEach((team) => (wrongAnswers[team.id] = 0));
    setStage1WrongAnswers(wrongAnswers);
    const initialStreaks: Record<number, number> = {};
    initialTeams.forEach((team) => (initialStreaks[team.id] = 0));
    setStage1SelfStreaks(initialStreaks);
    localStorage.removeItem("gameState");
    resetTurnPoints();
    setStage1QuestionsResolved(0);
  };

  // --- nowe pytanie ---
  const handleNewQuestion = () => {
    const questions = loadQuestions();
    const question = GameService.getRandomQuestion(questions, usedQuestionIds);
    if (question) {
      setCurrentQuestion(question);
      setUsedQuestionIds([...usedQuestionIds, question.id]);
      setShowAnswer(false);
    }
  };

    // --- poprawna odpowiedź ---
  const handleCorrectAnswer = (targetTeamId?: number | null, multiplier = 1) => {
    if (!activeTeamId) return;

    const normalizedMultiplier = Math.max(1, multiplier);

    // === STAGE 1 ===
    if (stage === "stage1") {
      const selfAnswer = targetTeamId === activeTeamId;
      if (selfAnswer) {
        const currentStreak = stage1SelfStreaks[activeTeamId] || 0;
        const newStreak = currentStreak + 1;
        const prevPending = totalPointsThisTurn;
        const newPending =
          prevPending > 0 ? prevPending * 2 : GameService.POINTS_SELF_ANSWER;
        const delta = newPending - prevPending;

        setStage1SelfStreaks((prev) => ({
          ...prev,
          [activeTeamId]: newStreak,
        }));

        applyPointsToTeam(activeTeamId, delta);
        setPointsThisTurn(delta);
        setTotalPointsThisTurn(newPending);

        setStage1Phase("question");
        handleNewQuestion();
      } else if (targetTeamId) {
        setStage1SelfStreaks((prev) => ({
          ...prev,
          [activeTeamId]: 0,
        }));
        applyPointsToTeam(activeTeamId, GameService.POINTS_CORRECT);
        setStage1Phase("question");
        setActiveTeamId(targetTeamId);
        handleNewQuestion();
        resetTurnPoints();
      } else {
        setStage1SelfStreaks((prev) => ({
          ...prev,
          [activeTeamId]: 0,
        }));
        applyPointsToTeam(activeTeamId, GameService.POINTS_CORRECT);
        setStage1Phase("wheel");
        setActiveTeamId(null);
        resetTurnPoints();
      }

      setShowAnswer(false);
      setStage1QuestionsResolved((prev) => prev + 1);
      return;
    }

    // === STAGE 2 ===
    if (stage === "stage2") {
      applyPointsToTeam(
        activeTeamId,
        GameService.POINTS_CORRECT * normalizedMultiplier
      );
      setActiveTeamId(null);
      setShowAnswer(false);
      return;
    }

    // === STAGE 3 === (finał)
    if (stage === "stage3-part1" || stage === "stage3-part2") {
      applyPointsToTeam(
        activeTeamId,
        GameService.POINTS_CORRECT * normalizedMultiplier
      );

      setQuestionCount((prev) => {
        const next = prev + 1;
        if (next >= finalQuestionLimit) {
          setStage("finished");
          localStorage.removeItem("gameState");
        }
        return next;
      });

      setActiveTeamId(null);
      setShowAnswer(false);
    }
  };
  // --- błędna odpowiedź ---
  const handleWrongAnswer = (pointsLost?: number) => {
    if (!activeTeamId) return;

    const penalty = Math.max(0, pointsLost ?? GameService.POINTS_CORRECT);

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id !== activeTeamId) return team;
        const currentWrongAnswers = stage1WrongAnswers[team.id] || 0;
        const nextWrongAnswers =
          stage === "stage1" ? currentWrongAnswers + 1 : currentWrongAnswers;
        const newChances = Math.max(0, team.chances - 1);
        const eliminated =
          stage === "stage1"
            ? nextWrongAnswers >= GameService.STAGE1_CHANCES
            : newChances <= 0;
        const newPoints = Math.max(0, team.points - penalty);

        return {
          ...team,
          points: newPoints,
          chances: newChances,
          eliminated,
        };
      })
    );

    if (stage === "stage1") {
      setStage1WrongAnswers((prev) => ({
        ...prev,
        [activeTeamId]: (prev[activeTeamId] || 0) + 1,
      }));

      setStage1Phase("wheel");
      setActiveTeamId(null);
      resetTurnPoints();
      setStage1SelfStreaks((prev) => ({
        ...prev,
        [activeTeamId]: 0,
      }));
      setStage1QuestionsResolved((prev) => prev + 1);
    }

    if (stage === "stage3-part1" || stage === "stage3-part2") {
      setQuestionCount((prev) => {
        const next = prev + 1;
        if (next >= finalQuestionLimit) {
          setStage("finished");
          localStorage.removeItem("gameState");
        }
        return next;
      });

      const activeTeams = teams.filter(
        (team) => !team.eliminated && team.id !== activeTeamId
      );
      if (activeTeams.length === 0) {
        setStage("finished");
        localStorage.removeItem("gameState");
      }
    }

    setShowAnswer(false);
  };
// --- inne akcje ---
  const handleManualSelectTeam = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team || team.eliminated) return;

    setActiveTeamId(teamId);
    if (stage === "stage1") {
      setStage1Phase("question");
      setStage1SelfStreaks((prev) => ({
        ...prev,
        [teamId]: 0,
      }));
      resetTurnPoints();
    }
  };

  const handleAddPoints = (teamId: number, points: number) => {
    setTeams(
      teams.map((t) =>
        t.id === teamId ? { ...t, points: t.points + points } : t
      )
    );
  };

  const handleNextStage = () => {
    if (stage === "stage1") {
      const aliveTeams = teams.filter((team) => !team.eliminated);
      if (aliveTeams.length) {
        moveTeamsToFinal(aliveTeams);
      }
    } else if (stage === "stage2") {
      setStage("stage3-part1");
      setQuestionCount(0);
    } else if (stage === "stage3-part1") {
      setStage("stage3-part2");
    }
  };

  const handleNewGame = () => {
    setTeams([]);
    setStage("setup");
    setActiveTeamId(null);
    setQuestionCount(0);
    setStage1WrongAnswers({});
    setCurrentQuestion(null);
    setUsedQuestionIds([]);
    setShowAnswer(false);
    setStage1QuestionsResolved(0);
    setStage1SelfStreaks({});
    resetTurnPoints();
    localStorage.removeItem("gameState");
  };

  const handleFinishGame = () => {
    setStage("finished");
    localStorage.removeItem("gameState");
  };

  const activeTeams = teams.filter((t) => !t.eliminated);
  const winner =
    stage === "finished" && activeTeams.length > 0
      ? activeTeams.reduce((prev, current) =>
          GameService.calculateFinalScore(current) >
          GameService.calculateFinalScore(prev)
            ? current
            : prev
        )
      : null;

  if (stage === "setup") {
    return <GameSetup onStart={handleGameStart} />;
  }

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

      <div className="max-w-[1920px] mx-auto">
        <div className="text-center mb-8 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-8 border-white rounded-3xl p-10 shadow-[0_0_100px_rgba(255,255,255,0.6)]">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white mb-3 tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
            JEDEN Z DZIESIĘCIU
          </h1>
          <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-4"></div>
          <p className="text-2xl text-white font-bold uppercase tracking-widest">
            Panel Prowadzącego
          </p>
        </div>

        <StageHeader
          stage={stage}
          questionCount={stage.includes("stage3") ? questionCount : undefined}
          questionLimit={finalQuestionLimit}
        />

        {stage === "finished" && winner ? (
          <WinnerDisplay
            winner={winner}
            teams={teams}
            onNewGame={handleNewGame}
          />
        ) : stage === "stage1" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <QuestionDisplay question={currentQuestion} showAnswer={showAnswer} />

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white">
                  <Users className="w-8 h-8 text-white" />
                  <h3 className="text-3xl font-bold text-white uppercase">
                    Drużyny
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isActive={team.id === activeTeamId}
                      stage={stage}
                      onClick={() => {
                        if (!team.eliminated) {
                          setActiveTeamId(team.id);
                          if (stage === "stage1") {
                            setStage1Phase("question");
                            setStage1SelfStreaks((prev) => ({
                              ...prev,
                              [team.id]: 0,
                            }));
                            resetTurnPoints();
                            handleNewQuestion();
                          } else {
                            handleNewQuestion();
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {stage1Phase === "wheel" ? (
                <FortuneWheel
                  teams={teams}
                  onTeamSelected={(teamId) => {
                    setActiveTeamId(teamId);
                    setStage1Phase("question");
                    setStage1SelfStreaks((prev) => ({
                      ...prev,
                      [teamId]: 0,
                    }));
                    resetTurnPoints();
                    handleNewQuestion();
                  }}
                  onFinishGame={handleFinishGame}
                />
              ) : stage1Phase === "question" && activeTeamId ? (
                <AnswerPanel
                  activeTeam={teams.find((t) => t.id === activeTeamId)!}
                  teams={teams}
                  questionId={currentQuestion?.id}
                  totalPointsThisTurn={totalPointsThisTurn}
                  showAnswer={showAnswer}
                  onToggleAnswer={() => setShowAnswer(!showAnswer)}
                  onCorrectAnswer={handleCorrectAnswer}
                  onWrongAnswer={handleWrongAnswer}
                  onCancel={() => {
                    setStage1Phase("wheel");
                    setActiveTeamId(null);
                    resetTurnPoints();
                    if (activeTeamId) {
                      setStage1SelfStreaks((prev) => ({
                        ...prev,
                        [activeTeamId]: 0,
                      }));
                    }
                  }}
                  onFinishGame={handleFinishGame}
                  selfStreak={activeTeamId ? stage1SelfStreaks[activeTeamId] || 0 : 0}
                />
              ) : (
                <ControlPanel
                  teams={teams}
                  activeTeamId={activeTeamId}
                  stage={stage}
                  currentQuestion={currentQuestion}
                  showAnswer={showAnswer}
                  onCorrectAnswer={handleCorrectAnswer}
                  onWrongAnswer={handleWrongAnswer}
                  onSelectTeam={handleManualSelectTeam}
                  onNextStage={handleNextStage}
                  onAddPoints={handleAddPoints}
                  onNewQuestion={handleNewQuestion}
                  onToggleAnswer={() => setShowAnswer(!showAnswer)}
                  onFinishGame={handleFinishGame}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <QuestionDisplay question={currentQuestion} showAnswer={showAnswer} />

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-white">
                  <Users className="w-8 h-8 text-white" />
                  <h3 className="text-3xl font-bold text-white uppercase">
                    Drużyny
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <TeamCard key={team.id} team={team} isActive={team.id === activeTeamId} stage={stage} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <ControlPanel
                teams={teams}
                activeTeamId={activeTeamId}
                stage={stage}
                currentQuestion={currentQuestion}
                showAnswer={showAnswer}
                onCorrectAnswer={handleCorrectAnswer}
                onWrongAnswer={handleWrongAnswer}
                onSelectTeam={handleManualSelectTeam}
                onNextStage={handleNextStage}
                onAddPoints={handleAddPoints}
                onNewQuestion={handleNewQuestion}
                onToggleAnswer={() => setShowAnswer(!showAnswer)}
                onFinishGame={handleFinishGame}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
