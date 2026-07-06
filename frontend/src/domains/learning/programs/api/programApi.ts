import { ROBOTICS_PROGRAMS } from '../../../../shared/constants/mock-data';
import type { Program } from '../../../../shared/types';
export async function getPrograms(): Promise<Program[]> {
  await new Promise(r => setTimeout(r, 200));
  return ROBOTICS_PROGRAMS;
}
export async function getProgramById(id: string): Promise<Program | undefined> {
  await new Promise(r => setTimeout(r, 100));
  return ROBOTICS_PROGRAMS.find(p => p.id === id);
}
