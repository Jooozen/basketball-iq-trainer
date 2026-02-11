import type { Question, DomainId } from '../types';

let cachedQuestions: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (cachedQuestions) return cachedQuestions;

  const res = await fetch('/questions.json');
  if (!res.ok) throw new Error('Failed to load questions');
  cachedQuestions = (await res.json()) as Question[];
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
