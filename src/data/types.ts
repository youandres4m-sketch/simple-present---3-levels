export type LevelId = 1 | 2 | 3;

export interface SlideItem {
  id: string;
  spanish: string;
  english: string;
}

export interface ExerciseItem {
  id: string;
  number: number; // 1 to 10
  title: string;
  grammarTopic: string;
  expectedWordCount: number;
  slides: SlideItem[]; // exactly 5 slides
}

export interface LevelItem {
  id: LevelId;
  code: string;
  name: string;
  structure: string;
  description: string;
  exercises: ExerciseItem[]; // exactly 10 exercises
}
