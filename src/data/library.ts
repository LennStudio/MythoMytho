import { parseWordsFile, type MissionPool, type MissionsFile, type WordTheme, type WordsFile } from '@/domain';
import wordsJson from './words.json';
import missionsJson from './missions.json';

/** Thèmes embarqués dans l'application (validés au chargement, disponibles hors ligne). */
export const BUILTIN_THEMES: readonly WordTheme[] = parseWordsFile(wordsJson as unknown as WordsFile);
const missions = missionsJson as unknown as MissionsFile;
export const MISSION_POOL: MissionPool = { words: missions.words, missions: missions.missions };
