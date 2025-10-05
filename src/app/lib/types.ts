export interface Team {
  id: number;
  name: string;
  chances: number;
  points: number;
  eliminated: boolean;
  members: number;
}

export type GameStage = 'setup' | 'stage1' | 'stage2' | 'stage3-part1' | 'stage3-part2' | 'finished';

export type QuestionType = 'text' | 'image' | 'audio' | 'video';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  mediaPath?: string;
  answer: string;
  category?: string;
}