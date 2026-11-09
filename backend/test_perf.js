import { performance } from 'perf_hooks';

// Test pre-compiled regex architecture
import { normalizeSpokenText } from './src/normalization/numeralNormalizer.js';

console.log('Testing speed and accuracy...');
const start = performance.now();
const res1 = normalizeSpokenText('मेरी सैलरी फ़िफ्टी थाउजेंड है और मंथली खर्चा सिकस्टी थाउजेंड है।');
console.log('Result 1:', res1, 'Time:', (performance.now() - start).toFixed(2), 'ms');
