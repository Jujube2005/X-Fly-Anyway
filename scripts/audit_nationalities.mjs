import { ALL_NATIONALITIES } from '../src/lib/constants.ts';

let duplicateCodes = 0;
let missingThai = 0;
let invalidCodes = 0;

const codes = new Set();
ALL_NATIONALITIES.forEach(n => {
  if (codes.has(n.value)) duplicateCodes++;
  codes.add(n.value);
  
  if (!n.th || n.th === n.en) missingThai++;
  
  if (typeof n.value !== 'string' || n.value.length !== 2) invalidCodes++;
});

console.log("A. Country count:", ALL_NATIONALITIES.length);
console.log("C. Duplicate count:", duplicateCodes);
console.log("D. Missing translation count:", missingThai);
console.log("E. Invalid code count:", invalidCodes);
