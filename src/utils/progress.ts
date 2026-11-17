import { LevelId, LevelItem } from '../data/types';

const STORAGE_KEY = 'simple_present_master_progress_v1';

export interface ProgressState {
  completedExerciseIds: string[];
  lastCompletedExerciseByLevel: Partial<Record<LevelId, number>>;
}

const DEFAULT_PROGRESS: ProgressState = {
  completedExerciseIds: [],
  lastCompletedExerciseByLevel: {},
};

export function loadProgress(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedExerciseIds: Array.isArray(parsed.completedExerciseIds)
        ? parsed.completedExerciseIds
        : [],
      lastCompletedExerciseByLevel:
        parsed.lastCompletedExerciseByLevel && typeof parsed.lastCompletedExerciseByLevel === 'object'
          ? parsed.lastCompletedExerciseByLevel
          : {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors in restricted browser modes
  }
}

export function getLevelCompletedCount(level: LevelItem, progress: ProgressState): number {
  const completedSet = new Set(progress.completedExerciseIds);
  return level.exercises.filter((ex) => completedSet.has(ex.id)).length;
}

export function getContinueExerciseIndex(level: LevelItem, progress: ProgressState): number {
  const completedSet = new Set(progress.completedExerciseIds);
  const lastCompletedNumber = progress.lastCompletedExerciseByLevel[level.id];

  if (typeof lastCompletedNumber === 'number') {
    const nextIdx = level.exercises.findIndex((ex) => ex.number > lastCompletedNumber && !completedSet.has(ex.id));
    if (nextIdx !== -1) return nextIdx;
  }

  const firstUncompletedIdx = level.exercises.findIndex((ex) => !completedSet.has(ex.id));
  if (firstUncompletedIdx !== -1) return firstUncompletedIdx;

  // All completed: start from Exercise 1 for review
  return 0;
}
