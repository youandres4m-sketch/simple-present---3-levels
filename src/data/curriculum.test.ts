import assert from 'node:assert/strict';
import test from 'node:test';
import { CURRICULUM } from './curriculum.ts';

function countWords(sentence: string): number {
  return sentence
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

test('Curriculum has exactly 3 levels, 30 exercises, and 150 slides', () => {
  assert.equal(CURRICULUM.length, 3);
  let totalExercises = 0;
  let totalSlides = 0;

  for (const level of CURRICULUM) {
    assert.equal(level.exercises.length, 10, `Level ${level.id} must have 10 exercises`);
    totalExercises += level.exercises.length;
    for (const exercise of level.exercises) {
      assert.equal(exercise.slides.length, 5, `${exercise.id} must have 5 slides`);
      totalSlides += exercise.slides.length;
    }
  }

  assert.equal(totalExercises, 30);
  assert.equal(totalSlides, 150);
});

test('Every slide matches its exercise exact English word count and has unique IDs', () => {
  const seenIds = new Set<string>();

  for (const level of CURRICULUM) {
    for (const exercise of level.exercises) {
      for (const slide of exercise.slides) {
        assert.ok(!seenIds.has(slide.id), `Duplicate slide id: ${slide.id}`);
        seenIds.add(slide.id);

        assert.ok(slide.spanish.trim().length > 0, `${slide.id} Spanish must not be empty`);
        assert.ok(slide.english.trim().length > 0, `${slide.id} English must not be empty`);

        const wordCount = countWords(slide.english);
        assert.equal(
          wordCount,
          exercise.expectedWordCount,
          `${slide.id} ("${slide.english}") has ${wordCount} words, expected ${exercise.expectedWordCount}`
        );
      }
    }
  }
});

test('Level 1 exercises include required prepositions and demonstratives', () => {
  const level1 = CURRICULUM[0];

  const ex5English = level1.exercises[4].slides.map((s) => s.english.toLowerCase()).join(' ');
  assert.ok(/\bin\b/.test(ex5English) && /\bon\b/.test(ex5English) && /\bat\b/.test(ex5English));

  const ex6English = level1.exercises[5].slides.map((s) => s.english.toLowerCase()).join(' ');
  assert.ok(/\bin\b/.test(ex6English) && /\bon\b/.test(ex6English) && /\bat\b/.test(ex6English));

  const ex7English = level1.exercises[6].slides.map((s) => s.english.toLowerCase()).join(' ');
  assert.ok(
    /\bthis\b/.test(ex7English) &&
      /\bthat\b/.test(ex7English) &&
      /\bthese\b/.test(ex7English) &&
      /\bthose\b/.test(ex7English)
  );
});

test('Level 2 slides are all grammatically valid negative sentences', () => {
  const level2 = CURRICULUM[1];

  for (const exercise of level2.exercises) {
    for (const slide of exercise.slides) {
      const lower = slide.english.toLowerCase();
      assert.ok(
        /\bnot\b|n't\b/.test(lower),
        `${slide.id} ("${slide.english}") must contain a negative marker`
      );
      // Ensure no "doesn't" followed by third-person -s verb
      const badDoesMatch = lower.match(/\bdoesn't\s+(\w+)/);
      if (badDoesMatch) {
        const verb = badDoesMatch[1];
        assert.ok(!verb.endsWith('s'), `${slide.id} verb after doesn't should be base form: ${verb}`);
      }
    }
  }
});

test('Level 3 slides are all properly punctuated questions with valid auxiliaries', () => {
  const level3 = CURRICULUM[2];

  for (const exercise of level3.exercises) {
    for (const slide of exercise.slides) {
      assert.ok(
        slide.spanish.startsWith('¿') && slide.spanish.endsWith('?'),
        `${slide.id} Spanish question must start with ¿ and end with ?: "${slide.spanish}"`
      );
      assert.ok(
        slide.english.endsWith('?'),
        `${slide.id} English question must end with ?: "${slide.english}"`
      );
    }
  }
});
