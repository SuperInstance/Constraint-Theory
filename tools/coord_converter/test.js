/**
 * Test suite for Coordinate Converter
 */

const assert = require('assert');
const { toDodecet, fromDodecet, batchConvert, CONFIG } = require('./convert');
const fs = require('fs');

console.log('Running Coordinate Converter tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Basic to-dodecet conversion
test('Basic to-dodecet conversion', () => {
  const result = toDodecet(1.0, 2.0, 3.0);
  assert(result.hex.startsWith('0x'));
  assert(result.binary.length === 36);
  assert(result.breakdown.x.value === 1.0);
  assert(result.breakdown.y.value === 2.0);
  assert(result.breakdown.z.value === 3.0);
});

// Test 2: Basic from-dodecet conversion
test('Basic from-dodecet conversion', () => {
  const result = toDodecet(1.0, 2.0, 3.0);
  const decoded = fromDodecet(result.hex);
  assert(Math.abs(decoded.x - 1.0) < 0.01);
  assert(Math.abs(decoded.y - 2.0) < 0.01);
  assert(Math.abs(decoded.z - 3.0) < 0.01);
});

// Test 3: Negative coordinates
test('Negative coordinates', () => {
  const result = toDodecet(-1.5, -2.5, -3.5);
  const decoded = fromDodecet(result.hex);
  assert(Math.abs(decoded.x - (-1.5)) < 0.01);
  assert(Math.abs(decoded.y - (-2.5)) < 0.01);
  assert(Math.abs(decoded.z - (-3.5)) < 0.01);
});

// Test 4: Zero coordinates
test('Zero coordinates', () => {
  const result = toDodecet(0, 0, 0);
  assert(result.hex === '0x000000');
  const decoded = fromDodecet(result.hex);
  assert(decoded.x === 0);
  assert(decoded.y === 0);
  assert(decoded.z === 0);
});

// Test 5: Maximum range
test('Maximum positive range', () => {
  const maxVal = CONFIG.maxValue * CONFIG.scale;
  const result = toDodecet(maxVal, maxVal, maxVal);
  const decoded = fromDodecet(result.hex);
  assert(Math.abs(decoded.x - maxVal) < CONFIG.scale);
  assert(Math.abs(decoded.y - maxVal) < CONFIG.scale);
  assert(Math.abs(decoded.z - maxVal) < CONFIG.scale);
});

// Test 6: Minimum range
test('Maximum negative range', () => {
  const minVal = CONFIG.minValue * CONFIG.scale;
  const result = toDodecet(minVal, minVal, minVal);
  const decoded = fromDodecet(result.hex);
  assert(Math.abs(decoded.x - minVal) < CONFIG.scale);
  assert(Math.abs(decoded.y - minVal) < CONFIG.scale);
  assert(Math.abs(decoded.z - minVal) < CONFIG.scale);
});

// Test 7: Out of range error
test('Out of range error handling', () => {
  let threw = false;
  try {
    toDodecet(100, 0, 0); // Way out of range
  } catch (error) {
    threw = true;
    assert(error.message.includes('out of range'));
  }
  assert(threw);
});

// Test 8: Round-trip precision
test('Round-trip precision', () => {
  const testCases = [
    [1.23, 4.56, 7.89],
    [-5.5, 3.3, -9.9],
    [0.01, 0.02, 0.03],
    [10.5, -10.5, 5.25]
  ];

  for (const [x, y, z] of testCases) {
    const encoded = toDodecet(x, y, z);
    const decoded = fromDodecet(encoded.hex);

    const error = Math.sqrt(
      Math.pow(x - decoded.x, 2) +
      Math.pow(y - decoded.y, 2) +
      Math.pow(z - decoded.z, 2)
    );

    assert(error < CONFIG.scale, `Precision error too high: ${error}`);
  }
});

// Test 9: Batch conversion
test('Batch conversion', () => {
  const inputFile = 'test_batch_input.json';
  const outputFile = 'test_batch_output.json';

  const testData = {
    coordinates: [
      { x: 1, y: 2, z: 3 },
      { x: -1, y: -2, z: -3 },
      { x: 0.5, y: 0.5, z: 0.5 }
    ]
  };

  fs.writeFileSync(inputFile, JSON.stringify(testData));

  const results = batchConvert(inputFile, outputFile);

  assert(results.summary.total === 3);
  assert(results.summary.errors === 0);
  assert(results.dodecets.length === 3);

  // Clean up
  fs.unlinkSync(inputFile);
  fs.unlinkSync(outputFile);
});

// Test 10: Invalid hex handling
test('Invalid hex handling', () => {
  let threw = false;
  try {
    fromDodecet('invalid');
  } catch (error) {
    threw = true;
    assert(error.message.includes('Invalid'));
  }
  assert(threw);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
