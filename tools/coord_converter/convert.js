#!/usr/bin/env node

/**
 * Agent Coordinate Converter
 *
 * Converts between standard 3D coordinates (x,y,z) and Dodecet 12-bit encoding.
 *
 * Usage:
 *   node convert.js to-dodecet <x> <y> <z>
 *   node convert.js from-dodecet <hex>
 *   node convert.js batch <input.json> <output.json>
 *   node convert.js interactive
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  bitsPerAxis: 12,
  scale: 0.01,  // units per step
  precision: 2,  // decimal places
  maxValue: 2047,
  minValue: -2048
};

/**
 * Convert a floating-point value to 12-bit signed integer
 */
function floatTo12Bit(value, scale = CONFIG.scale) {
  const scaled = Math.round(value / scale);

  if (scaled > CONFIG.maxValue || scaled < CONFIG.minValue) {
    throw new Error(`Value ${value} out of range [${CONFIG.minValue * scale}, ${CONFIG.maxValue * scale}]`);
  }

  // Handle negative values with two's complement
  if (scaled < 0) {
    return (0x1000 + scaled) & 0xFFF;
  }
  return scaled & 0xFFF;
}

/**
 * Convert 12-bit signed integer to floating-point
 */
function bit12ToFloat(value, scale = CONFIG.scale) {
  // Handle two's complement for negative values
  if (value & 0x800) {
    // Negative number
    return ((value - 0x1000) * scale);
  }
  return (value * scale);
}

/**
 * Convert (x, y, z) coordinates to dodecet hex string
 */
function toDodecet(x, y, z, scale = CONFIG.scale) {
  const xBits = floatTo12Bit(x, scale);
  const yBits = floatTo12Bit(y, scale);
  const zBits = floatTo12Bit(z, scale);

  // Combine into 36-bit value
  const dodecet = (xBits) | (yBits << 12) | (zBits << 24);

  return {
    hex: '0x' + dodecet.toString(16).toUpperCase().padStart(6, '0'),
    binary: dodecet.toString(2).padStart(36, '0'),
    breakdown: {
      x: { value: x, bits: xBits, hex: '0x' + xBits.toString(16).toUpperCase().padStart(3, '0') },
      y: { value: y, bits: yBits, hex: '0x' + yBits.toString(16).toUpperCase().padStart(3, '0') },
      z: { value: z, bits: zBits, hex: '0x' + zBits.toString(16).toUpperCase().padStart(3, '0') }
    }
  };
}

/**
 * Convert dodecet hex string to (x, y, z) coordinates
 */
function fromDodecet(hexString, scale = CONFIG.scale) {
  // Parse hex string
  const hex = hexString.startsWith('0x') ? hexString : '0x' + hexString;
  const dodecet = parseInt(hex, 16);

  if (isNaN(dodecet) || dodecet < 0 || dodecet > 0xFFFFFFFFF) {
    throw new Error(`Invalid dodecet value: ${hexString}`);
  }

  // Extract 12-bit values
  const xBits = dodecet & 0xFFF;
  const yBits = (dodecet >> 12) & 0xFFF;
  const zBits = (dodecet >> 24) & 0xFFF;

  return {
    x: parseFloat(bit12ToFloat(xBits, scale).toFixed(CONFIG.precision)),
    y: parseFloat(bit12ToFloat(yBits, scale).toFixed(CONFIG.precision)),
    z: parseFloat(bit12ToFloat(zBits, scale).toFixed(CONFIG.precision)),
    breakdown: {
      x: { bits: xBits, hex: '0x' + xBits.toString(16).toUpperCase().padStart(3, '0') },
      y: { bits: yBits, hex: '0x' + yBits.toString(16).toUpperCase().padStart(3, '0') },
      z: { bits: zBits, hex: '0x' + zBits.toString(16).toUpperCase().padStart(3, '0') }
    }
  };
}

/**
 * Batch convert coordinates from file
 */
function batchConvert(inputFile, outputFile, scale = CONFIG.scale) {
  const input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  if (!input.coordinates || !Array.isArray(input.coordinates)) {
    throw new Error('Input file must contain a "coordinates" array');
  }

  const results = {
    dodecets: [],
    summary: {
      total: input.coordinates.length,
      errors: 0,
      avgPrecisionLoss: 0
    }
  };

  let totalPrecisionLoss = 0;

  for (const coord of input.coordinates) {
    try {
      const dodecet = toDodecet(coord.x, coord.y, coord.z, scale);

      // Calculate precision loss
      const reconstructed = fromDodecet(dodecet.hex, scale);
      const loss = Math.sqrt(
        Math.pow(coord.x - reconstructed.x, 2) +
        Math.pow(coord.y - reconstructed.y, 2) +
        Math.pow(coord.z - reconstructed.z, 2)
      );
      totalPrecisionLoss += loss;

      results.dodecets.push({
        hex: dodecet.hex,
        x: coord.x,
        y: coord.y,
        z: coord.z,
        reconstructed: reconstructed
      });
    } catch (error) {
      results.summary.errors++;
      results.dodecets.push({
        error: error.message,
        input: coord
      });
    }
  }

  results.summary.avgPrecisionLoss = totalPrecisionLoss / input.coordinates.length;

  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  return results;
}

/**
 * Print formatted output for to-dodecet conversion
 */
function printToDodecet(x, y, z, result) {
  console.log(`\nInput:  (${x.toFixed(CONFIG.precision)}, ${y.toFixed(CONFIG.precision)}, ${z.toFixed(CONFIG.precision)})`);
  console.log(`Dodecet: ${result.hex}`);
  console.log(`Binary: ${result.binary}`);
  console.log('\nBreakdown:');
  console.log(`  X: ${result.breakdown.x.value.toFixed(CONFIG.precision).padStart(6)} -> ${result.breakdown.x.bits.toString().padStart(4)} -> ${result.breakdown.x.hex}`);
  console.log(`  Y: ${result.breakdown.y.value.toFixed(CONFIG.precision).padStart(6)} -> ${result.breakdown.y.bits.toString().padStart(4)} -> ${result.breakdown.y.hex}`);
  console.log(`  Z: ${result.breakdown.z.value.toFixed(CONFIG.precision).padStart(6)} -> ${result.breakdown.z.bits.toString().padStart(4)} -> ${result.breakdown.z.hex}`);
}

/**
 * Print formatted output for from-dodecet conversion
 */
function printFromDodecet(hexString, result) {
  console.log(`\nDodecet: ${hexString}`);
  console.log(`Output:  (${result.x}, ${result.y}, ${result.z})`);
  console.log('\nMetadata:');
  console.log(`  - Original precision: 12-bit`);
  console.log(`  - Scale used: ${CONFIG.scale} units`);
  console.log(`  - Conversion error: <${CONFIG.scale} units`);
}

/**
 * Interactive mode
 */
function interactiveMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== Dodecet Coordinate Converter - Interactive Mode ===\n');
  console.log('Commands:');
  console.log('  to <x> <y> <z>     - Convert to dodecet');
  console.log('  from <hex>         - Convert from dodecet');
  console.log('  scale <value>      - Set scale (current: ' + CONFIG.scale + ')');
  console.log('  help               - Show this help');
  console.log('  quit               - Exit\n');

  const prompt = () => {
    rl.question('> ', (input) => {
      const trimmed = input.trim().toLowerCase();

      if (trimmed === 'quit' || trimmed === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      if (trimmed === 'help') {
        console.log('\nCommands:');
        console.log('  to <x> <y> <z>     - Convert to dodecet');
        console.log('  from <hex>         - Convert from dodecet');
        console.log('  scale <value>      - Set scale');
        console.log('  quit               - Exit\n');
        prompt();
        return;
      }

      if (trimmed.startsWith('scale ')) {
        const value = parseFloat(trimmed.split(' ')[1]);
        if (!isNaN(value) && value > 0) {
          CONFIG.scale = value;
          console.log(`Scale set to ${value}`);
        } else {
          console.log('Invalid scale value');
        }
        prompt();
        return;
      }

      if (trimmed.startsWith('to ')) {
        const parts = trimmed.split(' ');
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          try {
            const result = toDodecet(x, y, z, CONFIG.scale);
            printToDodecet(x, y, z, result);
          } catch (error) {
            console.log(`Error: ${error.message}`);
          }
        } else {
          console.log('Invalid coordinates. Usage: to <x> <y> <z>');
        }
        prompt();
        return;
      }

      if (trimmed.startsWith('from ')) {
        const hex = trimmed.split(' ')[1];
        try {
          const result = fromDodecet(hex, CONFIG.scale);
          printFromDodecet(hex, result);
        } catch (error) {
          console.log(`Error: ${error.message}`);
        }
        prompt();
        return;
      }

      console.log('Unknown command. Type "help" for available commands.');
      prompt();
    });
  };

  prompt();
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node convert.js to-dodecet <x> <y> <z>');
    console.log('  node convert.js from-dodecet <hex>');
    console.log('  node convert.js batch <input.json> <output.json>');
    console.log('  node convert.js interactive');
    console.log('\nOptions:');
    console.log('  --scale <value>     Set scale (default: 0.01)');
    console.log('  --precision <n>     Set output precision (default: 2)');
    process.exit(1);
  }

  // Parse options
  let scale = CONFIG.scale;
  let precision = CONFIG.precision;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scale') {
      scale = parseFloat(args[++i]);
      CONFIG.scale = scale;
    } else if (args[i] === '--precision') {
      precision = parseInt(args[++i]);
      CONFIG.precision = precision;
    }
  }

  const command = args[0];

  try {
    switch (command) {
      case 'to-dodecet': {
        const x = parseFloat(args[1]);
        const y = parseFloat(args[2]);
        const z = parseFloat(args[3]);

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          console.error('Error: Invalid coordinates');
          process.exit(1);
        }

        const result = toDodecet(x, y, z, scale);
        printToDodecet(x, y, z, result);
        break;
      }

      case 'from-dodecet': {
        const hex = args[1];
        const result = fromDodecet(hex, scale);
        printFromDodecet(hex, result);
        break;
      }

      case 'batch': {
        const inputFile = args[1];
        const outputFile = args[2];

        if (!inputFile || !outputFile) {
          console.error('Error: Missing input or output file');
          process.exit(1);
        }

        console.log(`Processing ${inputFile}...`);
        const results = batchConvert(inputFile, outputFile, scale);
        console.log(`Done! Output written to ${outputFile}\n`);
        console.log('Summary:');
        console.log(`  - ${results.summary.total} coordinates processed`);
        console.log(`  - ${results.summary.errors} conversion errors`);
        console.log(`  - Average precision loss: ${results.summary.avgPrecisionLoss.toFixed(6)} units`);
        break;
      }

      case 'interactive': {
        interactiveMode();
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for programmatic use
module.exports = {
  toDodecet,
  fromDodecet,
  batchConvert,
  CONFIG
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
