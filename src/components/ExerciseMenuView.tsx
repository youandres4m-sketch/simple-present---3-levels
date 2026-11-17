import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Play, RotateCw } from 'lucide-react';
import { LevelItem } from '../data/types';
import { ProgressState, getContinueExerciseIndex, getLevelCompletedCount } from '../utils/progress';

interface ExerciseMenuViewProps {
  level: LevelItem;
  progress: ProgressState;
  onBackToHome: () => void;
  onSelectExercise: (exerciseIndex: number) => void;
}

export function ExerciseMenuView({
  level,
  progress,
  onBackToHome,
  onSelectExercise,
}: ExerciseMenuViewProps) {
  const completedSet = new Set(progress.completedExerciseIds);
  const completedCount = getLevelCompletedCount(level, progress);
  const totalExercises = level.exercises.length;
  const progressPercent = Math.round((completedCount / totalExercises) * 100);
  const continueIndex = getContinueExerciseIndex(level, progress);
  const continueExercise = level.exercises[continueIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBackToHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToHome]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Levels</span>
          </button>

          <div className="text-xs font-mono text-slate-500 whitespace-nowrap shrink-0">
            ESC · Level Menu
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <p className="text-xs font-mono font-medium text-blue-900 tracking-wider mb-2">
              {level.code} · {level.structure.toUpperCase()}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight text-balance">
              {level.name}
            </h1>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              {level.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectExercise(continueIndex)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>
              {completedCount > 0 && completedCount < totalExercises
                ? `Continue: Exercise ${continueExercise.number}`
                : completedCount === totalExercises
                  ? 'Review from Exercise 1'
                  : 'Start Exercise 1'}
            </span>
          </button>
        </div>

        <section aria-label="Level Progress" className="py-6 border-b border-slate-100">
          <div className="flex items-center justify-between text-sm mb-2.5 tabular-nums">
            <span className="font-medium text-slate-700">Level Progress</span>
            <span className="text-slate-600">
              {completedCount} / {totalExercises} exercises completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-900 rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section aria-label="Exercises List" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {level.exercises.map((exercise, index) => {
            const isCompleted = completedSet.has(exercise.id);
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelectExercise(index)}
                className="group text-left flex items-center justify-between gap-4 p-5 bg-white border border-slate-200 hover:border-blue-900/50 hover:bg-slate-50/60 rounded-2xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 tabular-nums">
                    <span className="font-mono font-medium text-blue-900">
                      Exercise {String(exercise.number).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{exercise.slides.length} slides</span>
                  </div>

                  <h2 className="text-lg font-semibold text-slate-950 truncate">
                    {exercise.title}
                  </h2>

                  <p className="text-sm text-slate-600 mt-0.5 truncate">
                    {exercise.grammarTopic}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Not started</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 group-hover:text-blue-900 border border-slate-200 group-hover:border-blue-900/40 bg-white rounded-xl transition-colors whitespace-nowrap">
                  {isCompleted ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Repeat</span>
                    </>
                  ) : (
                    <>
                      <span>Start</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
