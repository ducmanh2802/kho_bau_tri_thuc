import fs from 'fs';

// Parse math curriculum
const math = fs.readFileSync('src/data/mathCurriculum.ts', 'utf-8');

console.log('=== MATH LESSONS WITH < 10 QUESTIONS ===');

const topicRegex = /\{[\s\S]*?id: '([^']+)'[\s\S]*?lessons: \[([\s\S]*?)\]\s*\}/g;
let match;
while ((match = topicRegex.exec(math)) !== null) {
  const topicId = match[1];
  const lessonsContent = match[2];
  
  const lessonRegex = /\{[\s\S]*?id: '([^']+)'[\s\S]*?title: '([^']+)'[\s\S]*?questions: \[([\s\S]*?)\]\s*\}/g;
  let lessonMatch;
  while ((lessonMatch = lessonRegex.exec(lessonsContent)) !== null) {
    const lessonId = lessonMatch[1];
    const lessonTitle = lessonMatch[2];
    const questionsContent = lessonMatch[3];
    
    // Count questions by counting 'id:' occurrences in questions
    const questionCount = (questionsContent.match(/id: '[^']+'/g) || []).length;
    
    if (questionCount < 10) {
      console.log(`MATH: ${lessonId} (${lessonTitle}) - ${questionCount} questions`);
    } else {
      console.log(`MATH: ${lessonId} (${lessonTitle}) - ${questionCount} questions ✓`);
    }
  }
}

console.log('\n=== ENGLISH LESSONS WITH < 10 QUESTIONS ===');

const english = fs.readFileSync('src/data/englishCurriculum.ts', 'utf-8');

let match2;
while ((match2 = topicRegex.exec(english)) !== null) {
  const topicId = match2[1];
  const lessonsContent = match2[2];
  
  const lessonRegex = /\{[\s\S]*?id: '([^']+)'[\s\S]*?title: '([^']+)'[\s\S]*?questions: \[([\s\S]*?)\]\s*\}/g;
  let lessonMatch;
  while ((lessonMatch = lessonRegex.exec(lessonsContent)) !== null) {
    const lessonId = lessonMatch[1];
    const lessonTitle = lessonMatch[2];
    const questionsContent = lessonMatch[3];
    
    const questionCount = (questionsContent.match(/id: '[^']+'/g) || []).length;
    
    if (questionCount < 10) {
      console.log(`ENGLISH: ${lessonId} (${lessonTitle}) - ${questionCount} questions`);
    } else {
      console.log(`ENGLISH: ${lessonId} (${lessonTitle}) - ${questionCount} questions ✓`);
    }
  }
}