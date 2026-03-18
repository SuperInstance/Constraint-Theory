# Multiagent Simulator

A simulation tool for demonstrating origin-centric geometry and asymmetric understanding in multi-agent systems using dodecet encoding.

## Purpose

This simulator demonstrates how multiple agents with unique positions perceive and understand their environment differently. It showcases:

- **Origin-Centric Design**: Each agent views the world from its own perspective
- **Asymmetric Understanding**: Agents have different knowledge based on position
- **FPS-Style Filtering**: Perspective-based visibility and occlusion
- **Dodecet Encoding**: Efficient geometric representation for agent positions

## Installation

```bash
# Navigate to the tool directory
cd constrainttheory/tools/multiagent_sim

# Install dependencies
npm install

# Run the simulator
node simulate.js
```

## Usage

### Basic Simulation

```bash
# Run with default configuration (5 agents)
node simulate.js

# Specify number of agents
node simulate.js --agents 10

# Custom world size
node simulate.js --agents 8 --size 20
```

### Interactive Mode

```bash
# Interactive simulation with step-by-step control
node simulate.js --interactive
```

### Output Modes

```bash
# ASCII visualization
node simulate.js --output ascii

# JSON output (for piping to other tools)
node simulate.js --output json

# Detailed report
node simulate.js --output report
```

## How It Works

### Agent Perspective System

Each agent maintains its own coordinate system:

```
World Coordinates:  Shared global reference frame
Agent Coordinates:  Transformed to agent's perspective
Visibility Mask:    What the agent can "see"
Knowledge Graph:    What the agent "knows"
```

### Origin-Centric Geometry

Instead of sharing references, each agent:

1. **Transforms** world coordinates to its local frame
2. **Filters** visible agents based on line-of-sight
3. **Encodes** positions using dodecet (12-bit precision)
4. **Updates** its knowledge graph independently

### FPS-Style Visibility

Agents have a field of view and occlusion handling:

```
        Agent A (viewer)
           |
    FOV 60-degree cone
           |
    +------+------+------+
    |  B   |  C   |  D   |  <- Agents in world
    +------+------+------+
           |
    Visible: B, C (in FOV)
    Hidden:  D (behind C, occluded)
```

## Examples

### Example 1: 5-Agent Simulation

```bash
$ node simulate.js --agents 5 --output ascii

=== Multiagent Simulation ===
Agents: 5 | World Size: 10x10x10 | Ticks: 100

World State (Top-Down View):
+-------------------+
|    A              |
|                   |
|      B      C     |
|                   |
|         D         |
|                   |
|              E    |
+-------------------+

Agent A's Perspective:
+-------------------+
|    [SELF]         |
|        45-deg FOV |
|                   |
|      B      C     |
|                   |
+-------------------+
Visible agents: B (dodecet: 0x123456), C (dodecet: 0xABCDEF)
Knowledge: { agents: [B, C], confidence: [0.8, 0.6] }
```

### Example 2: Asymmetric Understanding Demo

```bash
$ node simulate.js --demo asymmetric

=== Asymmetric Understanding Demo ===

Agent A knows:
  - B: position (3, 2, 0), confidence 0.9
  - C: position (5, 2, 0), confidence 0.7
  - D: occluded by C
  - E: out of FOV

Agent E knows:
  - D: position (4, 4, 0), confidence 0.8
  - C: position (5, 2, 0), confidence 0.6
  - A, B: out of FOV

Key Insight: A and E have DIFFERENT knowledge about C!
  - A's confidence in C: 0.7
  - E's confidence in C: 0.6
  - This is asymmetric understanding - no shared reference!
```

### Example 3: Dodecet Encoding Efficiency

```bash
$ node simulate.js --demo encoding

=== Dodecet Encoding Efficiency ===

Traditional (x,y,z as floats):
  - 3 x 64 bits = 192 bits per position
  - 5 agents = 960 bits total

Dodecet (12-bit per axis):
  - 36 bits per position
  - 5 agents = 180 bits total

Compression: 81.25% reduction
Precision loss: <0.01 units (negligible)
```

## API Reference

### Agent Class

```javascript
const agent = new Agent({
  id: 'A',
  position: { x: 0, y: 0, z: 0 },
  fov: 60,        // Field of view in degrees
  range: 10,      // Visibility range
  encoding: 'dodecet'  // Position encoding
});
```

### World Class

```javascript
const world = new World({
  size: { x: 20, y: 20, z: 10 },
  agents: [agentA, agentB, agentC]
});

// Run simulation
world.tick();

// Get agent perspectives
const perspectives = world.getAllPerspectives();

// Export as JSON
const json = world.toJSON();
```

### Visibility Calculations

```javascript
// Check if agent A can see agent B
const visible = world.isVisible(agentA, agentB);

// Get all visible agents from A's perspective
const visibleAgents = world.getVisibleAgents(agentA);

// Get occlusion information
const occlusions = world.getOcclusions(agentA);
```

## Use Cases

### 1. Educational Demonstration

Show how origin-centric design leads to asymmetric understanding:

```bash
node simulate.js --demo asymmetric --explain
```

### 2. Performance Benchmarking

Test dodecet encoding efficiency:

```bash
node simulate.js --agents 100 --benchmark
```

### 3. Integration Testing

Generate test data for other tools:

```bash
node simulate.js --output json > test_scenarios.json
```

### 4. Visualization Data

Export for 3D visualization:

```bash
node simulate.js --output visualization.json
```

## Configuration

### config.json

```json
{
  "world": {
    "size": { "x": 20, "y": 20, "z": 10 },
    "tickRate": 100
  },
  "agents": {
    "default": {
      "fov": 60,
      "range": 10,
      "encoding": "dodecet"
    }
  },
  "simulation": {
    "maxTicks": 1000,
    "outputFormat": "ascii"
  }
}
```

## Output Formats

### ASCII

2D top-down visualization with ASCII art.

### JSON

Machine-readable output for integration:

```json
{
  "tick": 100,
  "agents": [
    {
      "id": "A",
      "position": { "x": 1.5, "y": 2.0, "z": 0 },
      "dodecet": "0x5E4199",
      "visible": ["B", "C"],
      "knowledge": {
        "B": { "confidence": 0.9, "lastSeen": 95 },
        "C": { "confidence": 0.7, "lastSeen": 98 }
      }
    }
  ]
}
```

### Report

Detailed analysis with insights:

```
=== Simulation Report ===

Duration: 1000 ticks
Agents: 5
Average visibility: 2.3 agents per tick
Asymmetric events: 47

Key Findings:
  - Agent A had highest visibility (avg 3.1)
  - 47 cases of asymmetric understanding detected
  - Dodecet encoding saved 81% memory vs floats

Recommendations:
  - Increase agent FOV for better coverage
  - Add communication protocol for knowledge sharing
```

## Technical Details

### Coordinate Transformation

```javascript
// World to agent-local coordinates
function worldToLocal(worldPos, agentPos) {
  return {
    x: worldPos.x - agentPos.x,
    y: worldPos.y - agentPos.y,
    z: worldPos.z - agentPos.z
  };
}
```

### Visibility Check

```javascript
function isVisible(viewer, target, world) {
  // 1. Check distance
  const distance = getDistance(viewer, target);
  if (distance > viewer.range) return false;

  // 2. Check FOV
  const angle = getAngle(viewer, target);
  if (angle > viewer.fov / 2) return false;

  // 3. Check occlusion
  if (isOccluded(viewer, target, world)) return false;

  return true;
}
```

### Dodecet Integration

Uses the coord_converter tool for efficient encoding:

```javascript
const { toDodecet } = require('../coord_converter/convert');

// Encode agent position
const encoded = toDodecet(position.x, position.y, position.z);
agent.encodedPosition = encoded.hex;
```

## Integration

### With constrainttheory/

```javascript
import { World } from './simulate';

// Create scenario for visualization
const world = new World({ size: { x: 10, y: 10, z: 5 } });
world.addAgent(agentA);
world.addAgent(agentB);

// Export to visualization
const data = world.toJSON();
// Pass to 3D renderer
```

### With claw/

```javascript
// Simulate Claw agent interactions
const { Agent } = require('./simulate');

class ClawAgent extends Agent {
  constructor(config) {
    super(config);
    this.equipment = config.equipment || [];
  }

  tick(world) {
    // Use Claw reasoning here
    const visible = this.getVisibleAgents(world);
    // Make decisions based on asymmetric knowledge
  }
}
```

## License

MIT License - Part of the SuperInstance ecosystem
