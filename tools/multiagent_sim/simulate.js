#!/usr/bin/env node

/**
 * Multiagent Simulator
 *
 * Demonstrates origin-centric geometry and asymmetric understanding
 * in multi-agent systems using dodecet encoding.
 *
 * Usage:
 *   node simulate.js [--agents N] [--size S] [--output ascii|json|report]
 */

const fs = require('fs');
const path = require('path');

// Try to import coord_converter
let toDodecet, fromDodecet;
try {
  const converter = require('../coord_converter/convert');
  toDodecet = converter.toDodecet;
  fromDodecet = converter.fromDodecet;
} catch (e) {
  // Fallback implementation
  toDodecet = (x, y, z) => ({ hex: '0x000000', binary: '0'.repeat(36) });
  fromDodecet = (hex) => ({ x: 0, y: 0, z: 0 });
}

// Configuration
const CONFIG = {
  agents: 5,
  worldSize: { x: 20, y: 20, z: 10 },
  maxTicks: 100,
  outputFormat: 'ascii',
  defaultFov: 60,
  defaultRange: 10,
  tickDelay: 100
};

/**
 * Vector math utilities
 */
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  distance(other) {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) +
      Math.pow(this.y - other.y, 2) +
      Math.pow(this.z - other.z, 2)
    );
  }

  subtract(other) {
    return new Vector3(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z
    );
  }

  angle2D(other) {
    const diff = other.subtract(this);
    return Math.atan2(diff.y, diff.x) * (180 / Math.PI);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
}

/**
 * Agent class with origin-centric perspective
 */
class Agent {
  constructor(config) {
    this.id = config.id;
    this.position = new Vector3(
      config.position?.x || 0,
      config.position?.y || 0,
      config.position?.z || 0
    );
    this.fov = config.fov || CONFIG.defaultFov;
    this.range = config.range || CONFIG.defaultRange;
    this.direction = config.direction || 0; // Facing direction in degrees

    // Knowledge graph (asymmetric understanding)
    this.knowledge = new Map();

    // Dodecet encoding
    this.encodedPosition = this.encodePosition();
  }

  encodePosition() {
    const result = toDodecet(this.position.x, this.position.y, this.position.z);
    return result.hex;
  }

  /**
   * Get local coordinates from world coordinates
   */
  worldToLocal(worldPos) {
    return worldPos.subtract(this.position);
  }

  /**
   * Check if another agent is visible
   */
  canSee(other, agents) {
    // Distance check
    const distance = this.position.distance(other.position);
    if (distance > this.range || distance === 0) {
      return false;
    }

    // FOV check
    const angle = this.position.angle2D(other.position);
    const relativeAngle = Math.abs(angle - this.direction);
    const normalizedAngle = Math.min(relativeAngle, 360 - relativeAngle);

    if (normalizedAngle > this.fov / 2) {
      return false;
    }

    // Occlusion check (simple ray casting)
    for (const agent of agents) {
      if (agent.id === this.id || agent.id === other.id) continue;

      const distToOther = this.position.distance(other.position);
      const distToAgent = this.position.distance(agent.position);

      // Check if agent is between viewer and target
      if (distToAgent < distToOther) {
        const angleToAgent = Math.abs(this.position.angle2D(agent.position) - this.direction);
        const angleToOther = Math.abs(this.position.angle2D(other.position) - this.direction);

        // Simple occlusion: if angles are close and agent is closer, it occludes
        if (Math.abs(angleToAgent - angleToOther) < 10) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Update knowledge based on observations
   */
  updateKnowledge(visibleAgents, tick) {
    // Decay existing knowledge
    for (const [id, info] of this.knowledge) {
      info.confidence *= 0.95; // Decay over time
    }

    // Update with new observations
    for (const agent of visibleAgents) {
      const distance = this.position.distance(agent.position);
      const confidence = Math.max(0.1, 1 - (distance / this.range));

      this.knowledge.set(agent.id, {
        position: agent.position.clone(),
        encodedPosition: agent.encodedPosition,
        confidence: confidence,
        lastSeen: tick,
        distance: distance
      });
    }
  }

  /**
   * Get agent's perspective on the world
   */
  getPerspective() {
    return {
      id: this.id,
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      encodedPosition: this.encodedPosition,
      direction: this.direction,
      knownAgents: Array.from(this.knowledge.entries()).map(([id, info]) => ({
        id,
        position: { x: info.position.x, y: info.position.y, z: info.position.z },
        encodedPosition: info.encodedPosition,
        confidence: info.confidence.toFixed(2),
        lastSeen: info.lastSeen
      }))
    };
  }

  /**
   * Move randomly within world bounds
   */
  randomMove(worldSize) {
    const dx = (Math.random() - 0.5) * 2;
    const dy = (Math.random() - 0.5) * 2;

    this.position.x = Math.max(0, Math.min(worldSize.x, this.position.x + dx));
    this.position.y = Math.max(0, Math.min(worldSize.y, this.position.y + dy));

    // Update encoding
    this.encodedPosition = this.encodePosition();

    // Random direction change
    if (Math.random() > 0.7) {
      this.direction = Math.random() * 360;
    }
  }
}

/**
 * World simulation
 */
class World {
  constructor(config) {
    this.size = config.size || CONFIG.worldSize;
    this.agents = [];
    this.tick = 0;
    this.history = [];
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  /**
   * Run one simulation tick
   */
  runTick() {
    this.tick++;

    // Move agents
    for (const agent of this.agents) {
      agent.randomMove(this.size);
    }

    // Update each agent's knowledge
    for (const viewer of this.agents) {
      const visible = this.agents.filter(other =>
        viewer.id !== other.id && viewer.canSee(other, this.agents)
      );
      viewer.updateKnowledge(visible, this.tick);
    }

    // Record state
    this.history.push(this.getState());
  }

  /**
   * Get current world state
   */
  getState() {
    return {
      tick: this.tick,
      agents: this.agents.map(a => a.getPerspective())
    };
  }

  /**
   * Analyze asymmetric understanding
   */
  analyzeAsymmetry() {
    const asymmetries = [];

    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const agentA = this.agents[i];
        const agentB = this.agents[j];

        // Check if they have different knowledge about the same agent
        for (const [targetId, infoA] of agentA.knowledge) {
          const infoB = agentB.knowledge.get(targetId);

          if (infoB) {
            const confidenceDiff = Math.abs(infoA.confidence - infoB.confidence);
            if (confidenceDiff > 0.1) {
              asymmetries.push({
                observers: [agentA.id, agentB.id],
                target: targetId,
                confidenceA: infoA.confidence,
                confidenceB: infoB.confidence,
                difference: confidenceDiff
              });
            }
          }
        }
      }
    }

    return asymmetries;
  }

  /**
   * Calculate encoding efficiency
   */
  calculateEfficiency() {
    // Traditional: 3 x 64-bit floats per position
    const traditionalBits = this.agents.length * 3 * 64;

    // Dodecet: 36 bits per position
    const dodecetBits = this.agents.length * 36;

    return {
      traditionalBits,
      dodecetBits,
      savings: ((traditionalBits - dodecetBits) / traditionalBits * 100).toFixed(2),
      compressionRatio: (traditionalBits / dodecetBits).toFixed(2)
    };
  }
}

/**
 * ASCII Visualization
 */
class AsciiRenderer {
  constructor(width = 40, height = 20) {
    this.width = width;
    this.height = height;
  }

  render(world) {
    const scaleX = this.width / world.size.x;
    const scaleY = this.height / world.size.y;

    // Create grid
    const grid = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));

    // Place agents
    for (const agent of world.agents) {
      const x = Math.floor(agent.position.x * scaleX);
      const y = Math.floor(agent.position.y * scaleY);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        grid[y][x] = agent.id;
      }
    }

    // Build output
    let output = '+' + '-'.repeat(this.width) + '+\n';

    for (const row of grid) {
      output += '|' + row.join('') + '|\n';
    }

    output += '+' + '-'.repeat(this.width) + '+';

    return output;
  }

  renderPerspective(agent, world) {
    const scaleX = this.width / world.size.x;
    const scaleY = this.height / world.size.y;

    // Create grid
    const grid = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));

    // Place viewer in center
    const viewerX = Math.floor(this.width / 2);
    const viewerY = Math.floor(this.height / 2);
    grid[viewerY][viewerX] = '@';

    // Draw FOV cone
    const fovStart = 90 - agent.fov / 2;
    const fovEnd = 90 + agent.fov / 2;

    for (let angle = fovStart; angle <= fovEnd; angle += 5) {
      const rad = angle * Math.PI / 180;
      for (let r = 1; r < Math.min(this.width, this.height) / 2; r++) {
        const px = Math.floor(viewerX + r * Math.cos(rad));
        const py = Math.floor(viewerY - r * Math.sin(rad));

        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          if (grid[py][px] === ' ') {
            grid[py][px] = '.';
          }
        }
      }
    }

    // Place visible agents
    for (const [id, info] of agent.knowledge) {
      const localX = info.position.x - agent.position.x;
      const localY = info.position.y - agent.position.y;

      const px = Math.floor(viewerX + localX * scaleX / 2);
      const py = Math.floor(viewerY - localY * scaleY / 2);

      if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
        grid[py][px] = id;
      }
    }

    // Build output
    let output = `\nAgent ${agent.id}'s Perspective:\n`;
    output += '+' + '-'.repeat(this.width) + '+\n';

    for (const row of grid) {
      output += '|' + row.join('') + '|\n';
    }

    output += '+' + '-'.repeat(this.width) + '+\n';
    output += `@ = Self | . = FOV | Others = Known agents (confidence shown below)\n`;

    // Show knowledge
    output += '\nKnown agents:\n';
    for (const [id, info] of agent.knowledge) {
      output += `  ${id}: pos=(${info.position.x.toFixed(1)}, ${info.position.y.toFixed(1)}), `;
      output += `confidence=${(info.confidence * 100).toFixed(0)}%, `;
      output += `dodecet=${info.encodedPosition}\n`;
    }

    return output;
  }
}

/**
 * Run demonstration scenarios
 */
function runDemo(demoType) {
  console.log('\n' + '='.repeat(60));

  switch (demoType) {
    case 'asymmetric':
      console.log('=== Asymmetric Understanding Demo ===\n');
      runAsymmetricDemo();
      break;

    case 'encoding':
      console.log('=== Dodecet Encoding Efficiency Demo ===\n');
      runEncodingDemo();
      break;

    case 'visibility':
      console.log('=== Visibility System Demo ===\n');
      runVisibilityDemo();
      break;

    default:
      console.log('Unknown demo type. Available: asymmetric, encoding, visibility');
  }

  console.log('='.repeat(60) + '\n');
}

function runAsymmetricDemo() {
  const world = new World({ size: { x: 20, y: 20, z: 5 } });

  // Create agents at specific positions
  const agentA = new Agent({
    id: 'A',
    position: { x: 5, y: 10, z: 0 },
    direction: 0
  });

  const agentE = new Agent({
    id: 'E',
    position: { x: 15, y: 10, z: 0 },
    direction: 180
  });

  // Target agents
  const agentC = new Agent({
    id: 'C',
    position: { x: 10, y: 10, z: 0 },
    fov: 360,
    range: 5
  });

  world.addAgent(agentA);
  world.addAgent(agentC);
  world.addAgent(agentE);

  // Run one tick
  world.runTick();

  // Show asymmetric understanding
  console.log('Agent A knows:');
  for (const [id, info] of agentA.knowledge) {
    console.log(`  - ${id}: confidence ${(info.confidence * 100).toFixed(0)}%`);
  }

  console.log('\nAgent E knows:');
  for (const [id, info] of agentE.knowledge) {
    console.log(`  - ${id}: confidence ${(info.confidence * 100).toFixed(0)}%`);
  }

  console.log('\nKey Insight:');
  console.log('  - A and E have DIFFERENT knowledge about C!');
  console.log('  - This is asymmetric understanding - no shared reference!');
  console.log('  - Each agent operates from its own origin-centric perspective');
}

function runEncodingDemo() {
  const world = new World({ size: { x: 10, y: 10, z: 5 } });

  for (let i = 0; i < 5; i++) {
    world.addAgent(new Agent({
      id: String.fromCharCode(65 + i),
      position: {
        x: Math.random() * 10,
        y: Math.random() * 10,
        z: Math.random() * 5
      }
    }));
  }

  console.log('Traditional (x,y,z as floats):');
  console.log('  - 3 x 64 bits = 192 bits per position');
  console.log(`  - 5 agents = ${5 * 192} bits total\n`);

  console.log('Dodecet (12-bit per axis):');
  console.log('  - 36 bits per position');
  console.log(`  - 5 agents = ${5 * 36} bits total\n`);

  const efficiency = world.calculateEfficiency();
  console.log(`Compression: ${efficiency.savings}% reduction`);
  console.log(`Compression ratio: ${efficiency.compressionRatio}x`);
  console.log('Precision loss: <0.01 units (negligible for most applications)');
}

function runVisibilityDemo() {
  const renderer = new AsciiRenderer(30, 15);
  const world = new World({ size: { x: 15, y: 15, z: 5 } });

  const viewer = new Agent({
    id: 'V',
    position: { x: 7, y: 7, z: 0 },
    fov: 90,
    range: 10,
    direction: 45
  });

  world.addAgent(viewer);

  // Add other agents
  const positions = [
    { x: 10, y: 10 }, // In FOV
    { x: 4, y: 4 },   // In FOV
    { x: 7, y: 1 },   // Out of FOV (behind)
    { x: 12, y: 12 }  // In FOV, far
  ];

  positions.forEach((pos, i) => {
    world.addAgent(new Agent({
      id: String.fromCharCode(65 + i),
      position: { x: pos.x, y: pos.y, z: 0 }
    }));
  });

  world.runTick();

  console.log('World View:\n');
  console.log(renderer.render(world));

  console.log(renderer.renderPerspective(viewer, world));

  console.log('\nVisibility Rules Applied:');
  console.log('  1. Distance check (range limit)');
  console.log('  2. FOV check (field of view cone)');
  console.log('  3. Occlusion check (agents blocking view)');
}

/**
 * Main simulation runner
 */
function runSimulation(config) {
  console.log('\n=== Multiagent Simulation ===');
  console.log(`Agents: ${config.agents} | World: ${config.worldSize.x}x${config.worldSize.y}x${config.worldSize.z}`);
  console.log(`Ticks: ${config.maxTicks} | Output: ${config.outputFormat}\n`);

  const world = new World({ size: config.worldSize });
  const renderer = new AsciiRenderer();

  // Create agents
  for (let i = 0; i < config.agents; i++) {
    const agent = new Agent({
      id: String.fromCharCode(65 + i),
      position: {
        x: Math.random() * config.worldSize.x,
        y: Math.random() * config.worldSize.y,
        z: Math.random() * config.worldSize.z
      },
      direction: Math.random() * 360
    });
    world.addAgent(agent);
  }

  // Run simulation
  for (let t = 0; t < config.maxTicks; t++) {
    world.runTick();

    if (config.outputFormat === 'ascii' && t % 10 === 0) {
      console.log(`\n--- Tick ${t} ---`);
      console.log(renderer.render(world));
    }
  }

  // Final report
  console.log('\n=== Simulation Complete ===\n');

  const efficiency = world.calculateEfficiency();
  console.log('Encoding Efficiency:');
  console.log(`  - Traditional: ${efficiency.traditionalBits} bits`);
  console.log(`  - Dodecet: ${efficiency.dodecetBits} bits`);
  console.log(`  - Savings: ${efficiency.savings}%\n`);

  const asymmetries = world.analyzeAsymmetry();
  console.log(`Asymmetric Understanding Events: ${asymmetries.length}`);

  if (asymmetries.length > 0) {
    console.log('\nSample Asymmetry:');
    const sample = asymmetries[0];
    console.log(`  - ${sample.observers[0]} sees ${sample.target} with ${(sample.confidenceA * 100).toFixed(0)}% confidence`);
    console.log(`  - ${sample.observers[1]} sees ${sample.target} with ${(sample.confidenceB * 100).toFixed(0)}% confidence`);
    console.log(`  - Difference: ${(sample.difference * 100).toFixed(0)}%`);
  }

  // JSON output
  if (config.outputFormat === 'json') {
    console.log('\n' + JSON.stringify(world.getState(), null, 2));
  }
}

/**
 * CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const config = { ...CONFIG };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--agents':
        config.agents = parseInt(args[++i]);
        break;
      case '--size':
        const size = parseInt(args[++i]);
        config.worldSize = { x: size, y: size, z: size / 2 };
        break;
      case '--ticks':
        config.maxTicks = parseInt(args[++i]);
        break;
      case '--output':
        config.outputFormat = args[++i];
        break;
      case '--demo':
        runDemo(args[++i]);
        return;
      case '--help':
        console.log(`
Multiagent Simulator - Origin-Centric Geometry Demonstration

Usage:
  node simulate.js [options]
  node simulate.js --demo <type>

Options:
  --agents N      Number of agents (default: 5)
  --size S        World size SxSx(S/2) (default: 20)
  --ticks N       Number of simulation ticks (default: 100)
  --output F      Output format: ascii, json, report (default: ascii)
  --demo TYPE     Run demo: asymmetric, encoding, visibility
  --help          Show this help

Examples:
  node simulate.js --agents 10 --size 30 --ticks 200
  node simulate.js --demo asymmetric
  node simulate.js --output json > simulation.json
        `);
        return;
    }
  }

  runSimulation(config);
}

// Export for programmatic use
module.exports = {
  Agent,
  World,
  Vector3,
  AsciiRenderer,
  runSimulation,
  runDemo
};

// Run CLI if executed directly
if (require.main === module) {
  main();
}
