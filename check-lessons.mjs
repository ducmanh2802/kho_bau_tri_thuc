import { MATH_TOPICS } from './src/data/mathCurriculum.ts';
import { ENGLISH_TOPICS } from './src/data/englishCurriculum.ts';

console.log('=== MATH LESSONS ===');
for (const topic of MATH_TOPICS) {
  for (const lesson of topic.lessons) {
    if (lesson.questions.length < 10) {
      console.log(`MATH: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions`);
    } else {
      console.log(`MATH: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions OK`);
    }
  }
}

console.log('\n=== ENGLISH LESSONS ===');
for (const topic of ENGLISH_TOPICS) {
  for (const lesson of topic.lessons) {
    if (lesson.questions.length < 10) {
      console.log(`ENGLISH: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions`);
    } else {
      console.log(`ENGLISH: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions OK`);
    }
  }
}