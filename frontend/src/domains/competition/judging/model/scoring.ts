export interface RubricCriterion {
  name: string;
  maxScore: number;
  score: number;
}

export interface AwardRubric {
  awardName: string;
  criteria: RubricCriterion[];
}

export function createRubric(awardName: string, criteriaNames: string[]): AwardRubric {
  return {
    awardName,
    criteria: criteriaNames.map(name => ({ name, maxScore: 20, score: 0 })),
  };
}

export function calculateTotal(rubric: AwardRubric): number {
  return rubric.criteria.reduce((sum, c) => sum + c.score, 0);
}

export function getMaxTotal(rubric: AwardRubric): number {
  return rubric.criteria.reduce((sum, c) => sum + c.maxScore, 0);
}

export const AWARD_CRITERIA = [
  'Mechanical Design',
  'Software/Programming',
  'Innovation & Creativity',
  'Documentation',
  'Team Interview',
];
