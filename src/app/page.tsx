"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Team, GameStage, Question } from "./lib";
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

  // --- przejście między etapami ---
  useEffect(() => {
    const activeTeamsCount = teams.filter((t) => !t.eliminated).length;

    if ((stage === "stage1" || stage === "stage2") && activeTeamsCount === 2) {
      setTeams(
        teams.map((t) =>
          !t.eliminated
            ? { ...t, chances: GameService.STAGE3_INITIAL_CHANCES }
            : t
        )
      );
      setStage("stage3-part1");
      setQuestionCount(0);
      setActiveTeamId(null);
      setCurrentQuestion(null);
      setShowAnswer(false);
      if (stage === "stage1") setStage1Phase("wheel");
    }
  }, [teams, stage]);

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
      };
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }
  }, [teams, stage, questionCount, stage1WrongAnswers, usedQuestionIds]);

  // --- start gry ---
  const handleGameStart = (initialTeams: Team[]) => {
    setTeams(initialTeams);
    setStage("stage1");
    const wrongAnswers: Record<number, number> = {};
    initialTeams.forEach((team) => {
      wrongAnswers[team.id] = 0;
    });
    setStage1WrongAnswers(wrongAnswers);
    localStorage.removeItem("gameState");
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
  const handleCorrectAnswer = (targetTeamId?: number) => {
    if (!activeTeamId) return;

    if (stage === "stage1") {
      // zawsze +10 pkt za poprawną odpowiedź
      const pointsToAdd = GameService.POINTS_CORRECT;

      setTeams(
        teams.map((t) =>
          t.id === activeTeamId ? { ...t, points: t.points + pointsToAdd } : t
        )
      );

      setPointsThisTurn(pointsToAdd);
      setTotalPointsThisTurn((prev) => prev + pointsToAdd);

      if (targetTeamId === activeTeamId) {
        // bierze na siebie – kontynuuje grę
        setStage1Phase("question");
        handleNewQuestion();
      } else if (targetTeamId) {
        // wskazuje przeciwnika
        setActiveTeamId(targetTeamId);
        setStage1Phase("question");
        handleNewQuestion();
      } else {
        // wraca do koła
        setStage1Phase("wheel");
        setActiveTeamId(null);
      }
    } else if (stage === "stage3-part1" || stage === "stage3-part2") {
      setTeams(
        teams.map((t) =>
          t.id === activeTeamId
            ? { ...t, points: t.points + GameService.POINTS_CORRECT }
            : t
        )
      );
      setQuestionCount((prev) => prev + 1);

      if (questionCount + 1 >= GameService.STAGE3_MAX_QUESTIONS) {
        setStage("finished");
        localStorage.removeItem("gameState");
      }

      setActiveTeamId(null);
    }

    setShowAnswer(false);
  };

  // --- błędna odpowiedź ---
  const handleWrongAnswer = () => {
    if (!activeTeamId) return;

    setTeams(
      teams.map((t) => {
        if (t.id === activeTeamId) {
          const currentWrongAnswers = stage1WrongAnswers[t.id] || 0;
          const nextWrongAnswers =
            stage === "stage1" ? currentWrongAnswers + 1 : currentWrongAnswers;
          const newChances = Math.max(0, t.chances - 1);
          const eliminated =
            stage === "stage1"
              ? nextWrongAnswers >= GameService.STAGE1_CHANCES
              : newChances <= 0;
          const newPoints = Math.max(0, t.points - GameService.POINTS_CORRECT); // -10 pkt

          return {
            ...t,
            points: newPoints,
            chances: newChances,
            eliminated,
          };
        }
        return t;
      })
    );

    if (stage === "stage1") {
      setStage1WrongAnswers((prev) => ({
        ...prev,
        [activeTeamId]: (prev[activeTeamId] || 0) + 1,
      }));

      // po błędzie wracamy do koła
      setStage1Phase("wheel");
      setActiveTeamId(null);
      setPointsThisTurn(0);
      setTotalPointsThisTurn(0);
    }

    if (stage === "stage3-part1" || stage === "stage3-part2") {
      setQuestionCount((prev) => prev + 1);

      const activeTeams = teams.filter(
        (t) => !t.eliminated && t.id !== activeTeamId
      );
      if (
        activeTeams.length === 0 ||
        questionCount + 1 >= GameService.STAGE3_MAX_QUESTIONS
      ) {
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
      setTeams(
        teams.map((t) =>
          !t.eliminated
            ? { ...t, chances: GameService.STAGE2_INITIAL_CHANCES }
            : t
        )
      );
      setStage("stage2");
    } else if (stage === "stage2") {
      setTeams(
        teams.map((t) =>
          !t.eliminated
            ? { ...t, chances: GameService.STAGE3_INITIAL_CHANCES }
            : t
        )
      );
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
                  onCancel={() => setStage1Phase("wheel")}
                  onFinishGame={handleFinishGame}
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
