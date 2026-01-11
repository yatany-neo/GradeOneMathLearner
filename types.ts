
export enum Difficulty {
  EASY = '简单',
  MEDIUM = '中等',
  HARD = '挑战'
}

export interface MathProblem {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
}

export interface UserStats {
  score: number;
  correctAnswers: number;
  totalAttempts: number;
}
