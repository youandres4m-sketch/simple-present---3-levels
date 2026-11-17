import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LayoutGrid, Square, Volume2 } from 'lucide-react';
import { LevelItem } from '../data/types';
import { isSpeechSupported, speakPronunciation, stopPronunciation } from '../utils/speech';

interface SlidePresentationViewProps {
  level: LevelItem;
  exerciseIndex: number;
  onReturnToMenu: () => void;
  onCompleteExercise: (exerciseId: string, exerciseNumber: number) => void;
  onNavigateExercise: (nextExerciseIndex: number) => void;
}

export function SlidePresentationView({
  level,
  exerciseIndex,
  onReturnToMenu,
  onCompleteExercise,
  onNavigateExercise,
}: SlidePresentationViewProps) {
  const exercise = level.exercises[exerciseIndex];
  const totalExercises = level.exercises.length;
  const totalSlides = exercise.slides.length;

  const [slideIndex, setSlideIndex] = useState(0);
  const [isEnglishVisible, setIsEnglishVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUnavailable, setSpeechUnavailable] = useState(false);

  // Reset to slide 1 and hidden English whenever switching exercises
  useEffect(() => {
    stopPronunciation();
    setIsSpeaking(false);
    setSlideIndex(0);
    setIsEnglishVisible(false);
  }, [exercise.id]);

  // Stop any ongoing speech on unmount
  useEffect(() => {
    return () => {
      stopPronunciation();
    };
  }, []);

  const currentSlide = exercise.slides[slideIndex];
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === totalSlides - 1;
  const hasNextExercise = exerciseIndex < totalExercises - 1;

  const handleTogglePronunciation = useCallback(() => {
    if (isSpeaking) {
      stopPronunciation();
      setIsSpeaking(false);
      return;
    }

    if (!isSpeechSupported()) {
      setSpeechUnavailable(true);
      return;
    }

    setSpeechUnavailable(false);
    setIsSpeaking(true);
    speakPronunciation(currentSlide.english, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setSpeechUnavailable(true);
      },
    });
  }, [isSpeaking, currentSlide.english]);

  const goToPreviousSlide = useCallback(() => {
    if (slideIndex > 0) {
      stopPronunciation();
      setIsSpeaking(false);
      setSlideIndex((prev) => prev - 1);
      setIsEnglishVisible(false);
    }
  }, [slideIndex]);

  const goToNextSlide = useCallback(() => {
    stopPronunciation();
    setIsSpeaking(false);
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((prev) => prev + 1);
      setIsEnglishVisible(false);
    } else {
      onCompleteExercise(exercise.id, exercise.number);
      if (hasNextExercise) {
        onNavigateExercise(exerciseIndex + 1);
      } else {
        onReturnToMenu();
      }
    }
  }, [
    slideIndex,
    totalSlides,
    onCompleteExercise,
    exercise.id,
    exercise.number,
    hasNextExercise,
    onNavigateExercise,
    exerciseIndex,
    onReturnToMenu,
  ]);

  const toggleEnglish = useCallback(() => {
    setIsEnglishVisible((prev) => !prev);
  }, []);

  const revealEnglish = useCallback(() => {
    setIsEnglishVisible(true);
  }, []);

  // Global keyboard shortcuts (work immediately without focusing a specific button)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        toggleEnglish();
        return;
      }

      if (e.key === 'Enter') {
        const activeTag = document.activeElement?.tagName;
        const isNavButton =
          activeTag === 'BUTTON' &&
          document.activeElement?.getAttribute('data-nav-control') === 'true';
        if (!isNavButton) {
          e.preventDefault();
          revealEnglish();
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSlide();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSlide();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onReturnToMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleEnglish, revealEnglish, goToNextSlide, goToPreviousSlide, onReturnToMenu]);

  const slideProgressPercent = Math.round(((slideIndex + 1) / totalSlides) * 100);

  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col justify-between select-none">
      {/* Top Bar: Exercise Name, Exercise Counter, Discreet Slide Counter */}
      <header className="w-full border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              data-nav-control="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onReturnToMenu();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              <span>Menu</span>
            </button>

            <div className="min-w-0">
              <div className="text-xs font-mono text-slate-500 truncate tabular-nums">
                {level.code} · {level.structure} · Exercise {exercise.number} / {totalExercises}
              </div>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-950 tracking-tight truncate">
                {exercise.number}. {exercise.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right tabular-nums">
              <div className="text-xs text-slate-400 font-medium">Slide</div>
              <div className="text-base md:text-lg font-mono font-semibold text-slate-700">
                {slideIndex + 1} / {totalSlides}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Progress Indicator */}
        <div className="h-0.5 w-full bg-slate-100">
          <div
            className="h-full bg-blue-900 transition-all duration-200"
            style={{ width: `${slideProgressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 py-10 md:py-16">
        <div className="w-full max-w-6xl mx-auto text-center flex flex-col items-center justify-center">
          {/* Very Large Spanish Sentence */}
          <p
            key={`${currentSlide.id}-es`}
            className="text-4xl sm:text-5xl md:text-[64px] lg:text-[78px] font-semibold tracking-tight text-slate-950 leading-[1.12] text-balance select-text"
          >
            {currentSlide.spanish}
          </p>

          {/* Divider + English Translation Container (steady vertical spacing) */}
          <div className="w-full mt-8 md:mt-12 pt-8 md:pt-12 border-t border-slate-100 min-h-[160px] md:min-h-[210px] flex flex-col items-center justify-center gap-5">
            {isEnglishVisible ? (
              <>
                <p
                  key={`${currentSlide.id}-en`}
                  className="text-3xl sm:text-4xl md:text-[56px] lg:text-[70px] font-semibold tracking-tight text-blue-900 leading-[1.14] text-balance transition-opacity duration-150 select-text"
                >
                  {currentSlide.english}
                </p>
                <button
                  type="button"
                  data-nav-control="true"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleTogglePronunciation();
                  }}
                  aria-label={isSpeaking ? 'Stop pronunciation' : 'Listen to English pronunciation'}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isSpeaking
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-900/40 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>Listen Pronunciation</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <p
                aria-hidden="true"
                className="text-base md:text-lg text-slate-300 font-normal tracking-wide"
              >
                English translation hidden
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Controls & Keyboard Legend */}
      <footer className="w-full border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-5 flex flex-col items-center gap-4">
          <div className="w-full flex flex-wrap items-center justify-center sm:justify-between gap-3">
            <button
              type="button"
              data-nav-control="true"
              disabled={isFirstSlide}
              onClick={(e) => {
                e.currentTarget.blur();
                goToPreviousSlide();
              }}
              className={`inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 text-sm md:text-base font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                isFirstSlide
                  ? 'border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                data-nav-control="true"
                onClick={(e) => {
                  e.currentTarget.blur();
                  handleTogglePronunciation();
                }}
                aria-label={isSpeaking ? 'Stop pronunciation' : 'Listen to English pronunciation'}
                className={`inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 text-sm md:text-base font-medium rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
                  isSpeaking
                    ? 'border-blue-900 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-blue-900" aria-hidden="true" />
                    <span>Listen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                data-nav-control="true"
                onClick={(e) => {
                  e.currentTarget.blur();
                  toggleEnglish();
                }}
                className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-8 py-3 text-sm md:text-base font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                {isEnglishVisible ? (
                  <>
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                    <span>Hide English</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    <span>Reveal English</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              data-nav-control="true"
              onClick={(e) => {
                e.currentTarget.blur();
                goToNextSlide();
              }}
              className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 text-sm md:text-base font-medium border border-slate-200 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isLastSlide ? (
                hasNextExercise ? (
                  <>
                    <span>Next Exercise</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Finish Level</span>
                  </>
                )
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {speechUnavailable && (
            <p className="text-xs text-amber-700">
              Audio pronunciation is not supported in this browser environment.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 text-center">
            <span className="font-medium text-slate-600">
              Press SPACEBAR to reveal the English translation.
            </span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
            <span className="font-mono text-xs text-slate-400">
              ← / → Navigate · Enter Reveal · Esc Menu
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
