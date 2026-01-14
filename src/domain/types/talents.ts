export interface TalentData {
  id: string;
  level: number;
}

export type TalentRef = string | TalentData;

export function normalizeTalent(talent: TalentRef): TalentData {
  if (typeof talent === 'string') {
    return { id: talent, level: 1 };
  }
  return talent;
}
