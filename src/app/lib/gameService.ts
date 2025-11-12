import { Team, Question } from './types';

export class GameService {
  static readonly STAGE1_CHANCES = 3;
  static readonly STAGE2_INITIAL_CHANCES = 3;
  static readonly STAGE3_INITIAL_CHANCES = 3;
  static readonly STAGE3_MAX_QUESTIONS = 30;
  static readonly POINTS_CORRECT = 10;
  static readonly POINTS_SELF_ANSWER = 10;
  static readonly POINTS_PER_CHANCE = 10;

  // --- Nowe: ile drużyn przechodzi do Stage3 w zależności od liczby startujących ---
  static getStage3Threshold(initialTeamsCount: number): number {
    return Math.max(2, Math.ceil(initialTeamsCount * 0.2)); // 20% drużyn, minimum 2
  }

  static checkStage1Elimination(wrongAnswers: number): boolean {
    return wrongAnswers >= 3;
  }

  static checkGeneralElimination(chances: number): boolean {
    return chances <= 0;
  }

  static shouldProgressToStage2(teams: Team[]): boolean {
    return teams.filter(t => !t.eliminated).length <= 10;
  }

  // --- Zmieniono: dynamiczny próg Stage3 ---
  static shouldProgressToStage3(teams: Team[], initialTeamsCount: number): boolean {
    return teams.filter(t => !t.eliminated).length <= this.getStage3Threshold(initialTeamsCount);
  }

  static calculateFinalScore(team: Team): number {
    return team.points + (team.chances * this.POINTS_PER_CHANCE);
  }

  static getRandomQuestion(questions: Question[], usedIds: number[]): Question | null {
    const available = questions.filter(q => !usedIds.includes(q.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }
}


export const GAME_CONSTANTS = {
  STAGE1_CHANCES: GameService.STAGE1_CHANCES,
  STAGE2_INITIAL_CHANCES: GameService.STAGE2_INITIAL_CHANCES,
  STAGE3_INITIAL_CHANCES: GameService.STAGE3_INITIAL_CHANCES,
  STAGE3_MAX_QUESTIONS: GameService.STAGE3_MAX_QUESTIONS,
  POINTS_CORRECT: GameService.POINTS_CORRECT,
  POINTS_SELF_ANSWER: GameService.POINTS_SELF_ANSWER,
  POINTS_PER_CHANCE: GameService.POINTS_PER_CHANCE
};
