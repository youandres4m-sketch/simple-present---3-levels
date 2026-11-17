import { ArrowRight, RotateCcw } from 'lucide-react';
import { LevelId, LevelItem } from '../data/types';
import { ProgressState, getLevelCompletedCount } from '../utils/progress';

interface HomeViewProps {
  levels: LevelItem[];
  progress: ProgressState;
  onSelectLevel: (levelId: LevelId) => void;
  onResetProgress: () => void;
}

export function HomeView({ levels, progress, onSelectLevel, onResetProgress }: HomeViewProps) {
  const totalExercises = levels.reduce((sum, lvl) => sum + lvl.exercises.length, 0);
  const totalSlides = levels.reduce(
    (sum, lvl) => sum + lvl.exercises.reduce((s, ex) => s + ex.slides.length, 0),
    0
  );
  const totalCompleted = progress.completedExerciseIds.length;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-8">
          <span className="text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            SENA Accounting Management
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-500 whitespace-nowrap shrink-0 tabular-nums">
            <span>{levels.length} Levels</span>
            <span aria-hidden="true">·</span>
            <span>{totalExercises} Exercises</span>
            <span aria-hidden="true">·</span>
            <span>{totalSlides} Slides</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {totalCompleted > 0 ? (
              <button
                type="button"
                onClick={onResetProgress}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset Progress
              </button>
            ) : (
              <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                Classroom Projector Ready
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 md:px-10 py-14 md:py-20 flex flex-col justify-center">
        <div className="max-w-3xl mb-14 md:mb-16">
          <p className="text-sm font-medium text-blue-900 tracking-wide mb-3">
            Accounting Edition · Gestión Contable
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-950 text-balance leading-[1.08]">
            SIMPLE PRESENT MASTER
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-slate-600 font-normal">
            English for Accounting Management
          </p>
        </div>

        <section aria-label="Course Levels" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {levels.map((level) => {
            const exerciseCount = level.exercises.length;
            const slideCount = level.exercises.reduce((sum, ex) => sum + ex.slides.length, 0);
            const completedCount = getLevelCompletedCount(level, progress);
            const progressPercent = Math.round((completedCount / exerciseCount) * 100);

            return (
              <article
                key={level.id}
                className="flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-7 md:p-8 transition-colors hover:border-blue-900/40"
              >
                <div>
                  <div className="text-xs font-mono font-medium text-blue-900 tracking-wider mb-3">
                    {level.code}
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-slate-950 tracking-tight leading-snug mb-2">
                    {level.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {level.description}
                  </p>
                </div>

                <div>
                  <div className="pt-5 border-t border-slate-100 space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Grammatical structure</span>
                      <span className="font-medium text-slate-900">{level.structure}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm tabular-nums">
                      <span className="text-slate-500">Number of exercises</span>
                      <span className="font-medium text-slate-900">{exerciseCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm tabular-nums">
                      <span className="text-slate-500">Number of slides</span>
                      <span className="font-medium text-slate-900">{slideCount}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 tabular-nums">
                        <span>Completion</span>
                        <span>
                          {completedCount} / {exerciseCount} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-900 rounded-full transition-all duration-200"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLevel(level.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                  >
                    <span>START LEVEL</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
