import { useCallback, useState } from 'react';
import { CURRICULUM } from './data/curriculum';
import { LevelId } from './data/types';
import { HomeView } from './components/HomeView';
import { ExerciseMenuView } from './components/ExerciseMenuView';
import { SlidePresentationView } from './components/SlidePresentationView';
import { ProgressState, loadProgress, saveProgress } from './utils/progress';

type AppScreen =
  | { view: 'home' }
  | { view: 'menu'; levelId: LevelId }
  | { view: 'slide'; levelId: LevelId; exerciseIndex: number };

export default function App() {
  const [screen, setScreen] = useState<AppScreen>({ view: 'home' });
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  const handleSelectLevel = useCallback((levelId: LevelId) => {
    setScreen({ view: 'menu', levelId });
  }, []);

  const handleBackToHome = useCallback(() => {
    setScreen({ view: 'home' });
  }, []);

  const handleSelectExercise = useCallback(
    (levelId: LevelId, exerciseIndex: number) => {
      setScreen({ view: 'slide', levelId, exerciseIndex });
    },
    []
  );

  const handleCompleteExercise = useCallback(
    (levelId: LevelId, exerciseId: string, exerciseNumber: number) => {
      setProgress((prev) => {
        const nextIds = prev.completedExerciseIds.includes(exerciseId)
          ? prev.completedExerciseIds
          : [...prev.completedExerciseIds, exerciseId];
        const nextProgress: ProgressState = {
          completedExerciseIds: nextIds,
          lastCompletedExerciseByLevel: {
            ...prev.lastCompletedExerciseByLevel,
            [levelId]: exerciseNumber,
          },
        };
        saveProgress(nextProgress);
        return nextProgress;
      });
    },
    []
  );

  const handleResetProgress = useCallback(() => {
    const empty: ProgressState = {
      completedExerciseIds: [],
      lastCompletedExerciseByLevel: {},
    };
    saveProgress(empty);
    setProgress(empty);
  }, []);

  if (screen.view === 'home') {
    return (
      <HomeView
        levels={CURRICULUM}
        progress={progress}
        onSelectLevel={handleSelectLevel}
        onResetProgress={handleResetProgress}
      />
    );
  }

  const activeLevel = CURRICULUM.find((l) => l.id === screen.levelId) ?? CURRICULUM[0];

  if (screen.view === 'menu') {
    return (
      <ExerciseMenuView
        level={activeLevel}
        progress={progress}
        onBackToHome={handleBackToHome}
        onSelectExercise={(exerciseIndex) =>
          handleSelectExercise(activeLevel.id, exerciseIndex)
        }
      />
    );
  }

  return (
    <SlidePresentationView
      level={activeLevel}
      exerciseIndex={screen.exerciseIndex}
      onReturnToMenu={() => setScreen({ view: 'menu', levelId: activeLevel.id })}
      onCompleteExercise={(exerciseId, exerciseNumber) =>
        handleCompleteExercise(activeLevel.id, exerciseId, exerciseNumber)
      }
      onNavigateExercise={(nextIndex) =>
        setScreen({ view: 'slide', levelId: activeLevel.id, exerciseIndex: nextIndex })
      }
    />
  );
}
