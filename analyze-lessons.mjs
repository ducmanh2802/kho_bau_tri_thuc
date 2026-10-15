import { mathCurriculum } from './src/data/mathCurriculum.ts';
import { ENGLISH_TOPICS } from './src/data/englishCurriculum.ts';

console.log('=== MATH LESSONS ===');
for (const topic of mathCurriculum) {
  for (const lesson of topic.lessons) {
    if (lesson.questions.length < 10) {
      console.log(`LESSON: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions`);
    }
  }
}

console.log('\n=== ENGLISH LESSONS ===');
for (const topic of ENGLISH_TOPICS) {
  for (const lesson of topic.lessons) {
    if (lesson.questions.length < 10) {
      console.log(`LESSON: ${lesson.id} (${lesson.title}) - ${lesson.questions.length} questions`);
    }
  }
}