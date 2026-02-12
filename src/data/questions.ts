import type { Question, DomainId } from '../types';

interface V2Question {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

interface V2Category {
  id: string;
  layer: number;
  name: string;
  icon: string;
  description: string;
  questions: V2Question[];
}

interface V2Data {
  meta: { title: string; version: string; description: string };
  categories: V2Category[];
}

function assignLevel(index: number, total: number): number {
  const perLevel = Math.ceil(total / 3);
  return Math.min(3, Math.floor(index / perLevel) + 1);
}

/** Fisher-Yates shuffle for choice order randomization */
function shuffleChoices(
  choices: string[],
  correctIndex: number,
): { choices: string[]; correctIndex: number } {
  const indices = choices.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map((i) => choices[i]);
  const newCorrectIndex = indices.indexOf(correctIndex);
  return { choices: shuffled, correctIndex: newCorrectIndex };
}

function transformV2(data: V2Data): Question[] {
  const questions: Question[] = [];
  for (const cat of data.categories) {
    const total = cat.questions.length;
    cat.questions.forEach((q, i) => {
      const { choices, correctIndex } = shuffleChoices(q.choices, q.answer);
      questions.push({
        id: q.id,
        domainId: cat.id as DomainId,
        level: assignLevel(i, total),
        text: q.question,
        choices,
        correctIndex,
        explanation: q.explanation,
      });
    });
  }
  return questions;
}

let cachedQuestions: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;

  const res = await fetch('/questions.json');
  if (!res.ok) throw new Error('Failed to load questions');
  const raw = await res.json();

  // Support both v2 (categories) and v1 (flat array) formats
  if (raw.categories) {
    cachedQuestions = transformV2(raw as V2Data);
  } else {
    cachedQuestions = raw as Question[];
  }
  return cachedQuestions;
}

export function getQuestionsByDomain(
  questions: Question[],
  domainId: DomainId,
  level?: number,
): Question[] {
  return questions.filter(
    (q) => q.domainId === domainId && (level == null || q.level === level),
  );
}

export function getQuestionById(
  questions: Question[],
  id: string,
): Question | undefined {
  return questions.find((q) => q.id === id);
}
