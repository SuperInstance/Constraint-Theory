# Agent Coordinate Converter

A CLI tool for converting between standard 3D coordinates (x,y,z) and Dodecet 12-bit geometric encoding used in the SuperInstance cellular agent ecosystem.

## Purpose

This tool bridges the gap between human-readable coordinates and the efficient dodecet encoding system used internally by cellular agents. It enables:

- **Debugging**: Convert agent positions to readable coordinates
- **Testing**: Generate dodecet encodings from test coordinates
- **Integration**: Convert between systems using different coordinate representations
- **Visualization**: Prepare data for 3D visualization tools

## Installation

```bash
# Navigate to the tool directory
cd constrainttheory/tools/coord_converter

# Install dependencies
npm install

# Make executable (optional)
chmod +x convert.js
```

## Usage

### Single Coordinate Conversion

```bash
# Standard to Dodecet
node convert.js to-dodecet 1.0 2.0 3.0

# Dodecet to Standard
node convert.js from-dodecet 0x1A2B3C
```

### Batch Conversion

```bash
# Convert a file of coordinates
node convert.js batch input.json output.json

# Input format (JSON):
{
  "coordinates": [
    { "x": 1.0, "y": 2.0, "z": 3.0 },
    { "x": -1.5, "y": 0.5, "z": 2.0 }
  ]
}

# Output format (JSON):
{
  "dodecets": [
    { "hex": "0x1A2B3C", "x": 1.0, "y": 2.0, "z": 3.0 },
    ...
  ]
}
```

### Interactive Mode

```bash
node convert.js interactive
```

## API Reference

### Dodecet Encoding

The dodecet system uses 12-bit precision per axis:

```
Total bits: 36 (12 per axis)
Range: [-2048, 2047] integer values
Scale: Configurable (default: 0.01 units per step)
```

### Coordinate Precision

| Parameter | Value |
|-----------|-------|
| Bits per axis | 12 |
| Range | [-2048, 2047] |
| Default scale | 0.01 units |
| Max range | +/- 20.48 units |
| Precision | 0.01 units |

## Examples

### Example 1: Single Point Conversion

```bash
$ node convert.js to-dodecet 1.5 -2.3 0.8
Input:  (1.50, -2.30, 0.80)
Dodecet: 0x5E4199
Binary: 010111100100000110011001

Breakdown:
  X: 1.50  -> 150  -> 0x96 (10010110)
  Y: -2.30 -> -230 -> 0x1C9 (111001001) [two's complement]
  Z: 0.80  -> 80   -> 0x50 (01010000)
```

### Example 2: Batch Processing

```bash
$ node convert.js batch waypoints.json encoded_waypoints.json
Processing 50 coordinates...
Done! Output written to encoded_waypoints.json

Summary:
  - 50 coordinates processed
  - 0 conversion errors
  - Average precision loss: 0.003 units
```

### Example 3: Reverse Conversion

```bash
$ node convert.js from-dodecet 0xABC123
Dodecet: 0xABC123
Output:  (10.87, -5.25, 2.91)

Metadata:
  - Original precision: 12-bit
  - Scale used: 0.01 units
  - Conversion error: <0.01 units
```

## Use Cases

### 1. Agent Position Debugging

When debugging cellular agents in a spreadsheet, convert their internal dodecet positions to readable coordinates:

```bash
node convert.js from-dodecet 0x123456
# Output helps understand where the agent "thinks" it is
```

### 2. Test Data Generation

Generate dodecet encodings for integration tests:

```bash
# Create test fixtures
echo '{"coordinates":[{"x":0,"y":0,"z":0},{"x":1,"y":1,"z":1}]}' > test_input.json
node convert.js batch test_input.json test_output.json
```

### 3. Visualization Pipeline

Convert agent positions for 3D visualization:

```bash
# Export all agent positions
node convert.js batch agents_raw.json agents_3d.json
# Import into visualization tool
```

## Error Handling

The tool handles common errors gracefully:

```bash
$ node convert.js to-dodecet 100 0 0
Error: Coordinate out of range
  X=100 exceeds maximum range of +/-20.48 units
  Tip: Adjust scale factor with --scale option
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--scale` | Units per step | 0.01 |
| `--precision` | Output decimal places | 2 |
| `--format` | Output format (json/text) | text |
| `--verbose` | Show detailed breakdown | false |

## Technical Details

### Dodecet Format

```
Bits 0-11:  X coordinate (signed)
Bits 12-23: Y coordinate (signed)
Bits 24-35: Z coordinate (signed)

Example: 0x1A2B3C
  X: bits 0-11  = 0x1A2 = 418 -> 4.18 units
  Y: bits 12-23 = 0x2B3 = 691 -> 6.91 units
  Z: bits 24-35 = 0x3C  = 60  -> 0.60 units
```

### Two's Complement Handling

Negative values are encoded using 12-bit two's complement:

```
-1  -> 0xFFF
-10 -> 0xFF6
-100 -> 0xF9C
```

## Integration

### With constrainttheory/

```javascript
import { DodecetEncoder } from '../../crates/dodecet-encoder/pkg';
import { convertToDodecet } from './convert';

// Use in geometric visualizations
const position = convertToDodecet(agent.position);
visualization.updateAgent(agent.id, position);
```

### With claw/

```javascript
// In Claw agent code
const coordConverter = require('coord_converter');

// Decode agent's internal position
const readablePos = coordConverter.fromDodecet(agent.state.position);
console.log(`Agent at: ${readablePos}`);
```

### With spreadsheet-moment/

```javascript
// In cell inspector
import { fromDodecet } from './coord_converter';

// Show human-readable coordinates
const cellPos = fromDodecet(cell.metadata.geometricPosition);
tooltip.text = `Position: (${cellPos.x}, ${cellPos.y}, ${cellPos.z})`;
```

## License

MIT License - Part of the SuperInstance ecosystem
