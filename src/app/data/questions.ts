import questionsData from './questions.json';
import { Question } from '../lib/types';

export const loadQuestions = (): Question[] => {
  return questionsData.questions;
};