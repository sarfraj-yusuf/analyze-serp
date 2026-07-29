import { countSyllables, calculateReadability } from './readability';

console.log('--- Testing Syllable Counter ---');
const sampleWords = ['cat', 'apple', 'education', 'algorithm', 'readability', 'the', 'beautiful'];
sampleWords.forEach((word) => {
  console.log(`Word: "${word}" -> Syllables: ${countSyllables(word)}`);
});

console.log('\n--- Testing Flesch-Kincaid Readability Engine ---');
const sampleText = `On-page SEO is the practice of optimizing web page content for search engines and users. Common on-page SEO practices include optimizing title tags, content, internal links and URLs.`;

const metrics = calculateReadability(sampleText);
console.log('Sample Text Metrics:', JSON.stringify(metrics, null, 2));

if (metrics.fleschReadingEase > 0 && metrics.fleschGradeLevel > 0) {
  console.log('\n✅ Readability engine test PASSED!');
} else {
  console.error('\n❌ Readability engine test FAILED!');
  process.exit(1);
}
