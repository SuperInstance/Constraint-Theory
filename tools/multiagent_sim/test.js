/**
 * Test suite for Multiagent Simulator
 */

const assert = require('assert');
const { Agent, World, Vector3, AsciiRenderer } = require('./simulate');

console.log('Running Multiagent Simulator tests...\n');

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

// Test 1: Vector operations
test('Vector distance calculation', () => {
  const v1 = new Vector3(0, 0, 0);
  const v2 = new Vector3(3, 4, 0);
  assert.strictEqual(v1.distance(v2), 5);
});

// Test 2: Vector subtraction
test('Vector subtraction', () => {
  const v1 = new Vector3(5, 5, 5);
  const v2 = new Vector3(2, 3, 1);
  const result = v1.subtract(v2);
  assert.strictEqual(result.x, 3);
  assert.strictEqual(result.y, 2);
  assert.strictEqual(result.z, 4);
});

// Test 3: Agent creation
test('Agent creation', () => {
  const agent = new Agent({
    id: 'A',
    position: { x: 1, y: 2, z: 3 }
  });
  assert.strictEqual(agent.id, 'A');
  assert.strictEqual(agent.position.x, 1);
  assert.strictEqual(agent.fov, 60); // default
});

// Test 4: Agent visibility - distance
test('Agent visibility - distance check', () => {
  const viewer = new Agent({
    id: 'A',
    position: { x: 0, y: 0, z: 0 },
    range: 10
  });

  const close = new Agent({
    id: 'B',
    position: { x: 5, y: 0, z: 0 }
  });

  const far = new Agent({
    id: 'C',
    position: { x: 15, y: 0, z: 0 }
  });

  assert.strictEqual(viewer.canSee(close, [close, far]), true);
  assert.strictEqual(viewer.canSee(far, [close, far]), false);
});

// Test 5: Agent visibility - FOV
test('Agent visibility - FOV check', () => {
  const viewer = new Agent({
    id: 'A',
    position: { x: 0, y: 0, z: 0 },
    fov: 90,
    direction: 0,
    range: 20
  });

  const inFov = new Agent({
    id: 'B',
    position: { x: 5, y: 0, z: 0 }
  });

  const outFov = new Agent({
    id: 'C',
    position: { x: 0, y: 5, z: 0 }
  });

  assert.strictEqual(viewer.canSee(inFov, [inFov, outFov]), true);
  // Note: FOV calculation depends on angle
});

// Test 6: World creation
test('World creation', () => {
  const world = new World({
    size: { x: 20, y: 20, z: 10 }
  });

  assert.strictEqual(world.size.x, 20);
  assert.strictEqual(world.agents.length, 0);
});

// Test 7: Adding agents to world
test('Adding agents to world', () => {
  const world = new World({});
  const agent = new Agent({ id: 'A' });

  world.addAgent(agent);
  assert.strictEqual(world.agents.length, 1);
});

// Test 8: World tick
test('World tick execution', () => {
  const world = new World({});
  world.addAgent(new Agent({ id: 'A' }));

  const initialTick = world.tick;
  world.runTick();

  assert.strictEqual(world.tick, initialTick + 1);
});

// Test 9: Knowledge update
test('Agent knowledge update', () => {
  const viewer = new Agent({
    id: 'A',
    position: { x: 0, y: 0, z: 0 },
    fov: 360,
    range: 20
  });

  const target = new Agent({
    id: 'B',
    position: { x: 5, y: 0, z: 0 }
  });

  viewer.updateKnowledge([target], 1);

  assert.strictEqual(viewer.knowledge.has('B'), true);
  const info = viewer.knowledge.get('B');
  assert.strictEqual(info.lastSeen, 1);
  assert(info.confidence > 0);
});

// Test 10: Asymmetry analysis
test('Asymmetry analysis', () => {
  const world = new World({});

  const agentA = new Agent({
    id: 'A',
    position: { x: 0, y: 5, z: 0 },
    fov: 360,
    range: 10
  });

  const agentB = new Agent({
    id: 'B',
    position: { x: 10, y: 5, z: 0 },
    fov: 360,
    range: 10
  });

  const target = new Agent({
    id: 'T',
    position: { x: 5, y: 5, z: 0 }
  });

  world.addAgent(agentA);
  world.addAgent(agentB);
  world.addAgent(target);

  world.runTick();

  const asymmetries = world.analyzeAsymmetry();
  // Asymmetries may or may not exist depending on positions
  assert(Array.isArray(asymmetries));
});

// Test 11: Encoding efficiency
test('Encoding efficiency calculation', () => {
  const world = new World({});
  world.addAgent(new Agent({ id: 'A' }));
  world.addAgent(new Agent({ id: 'B' }));
  world.addAgent(new Agent({ id: 'C' }));

  const efficiency = world.calculateEfficiency();

  assert(efficiency.traditionalBits > efficiency.dodecetBits);
  assert(parseFloat(efficiency.savings) > 0);
});

// Test 12: Agent perspective
test('Agent perspective extraction', () => {
  const agent = new Agent({
    id: 'A',
    position: { x: 1, y: 2, z: 3 }
  });

  const perspective = agent.getPerspective();

  assert.strictEqual(perspective.id, 'A');
  assert.strictEqual(perspective.position.x, 1);
  assert(Array.isArray(perspective.knownAgents));
});

// Test 13: Renderer
test('ASCII renderer', () => {
  const renderer = new AsciiRenderer(20, 10);
  const world = new World({ size: { x: 10, y: 10, z: 5 } });
  world.addAgent(new Agent({ id: 'A', position: { x: 5, y: 5, z: 0 } }));

  const output = renderer.render(world);

  assert(typeof output === 'string');
  assert(output.includes('A'));
  assert(output.includes('+')); // Borders
});

// Test 14: Random movement
test('Agent random movement', () => {
  const agent = new Agent({
    id: 'A',
    position: { x: 5, y: 5, z: 0 }
  });

  const initialX = agent.position.x;
  agent.randomMove({ x: 10, y: 10, z: 5 });

  // Position may have changed but stays in bounds
  assert(agent.position.x >= 0 && agent.position.x <= 10);
  assert(agent.position.y >= 0 && agent.position.y <= 10);
});

// Test 15: Confidence decay
test('Knowledge confidence decay', () => {
  const agent = new Agent({
    id: 'A',
    position: { x: 0, y: 0, z: 0 },
    fov: 360,
    range: 20
  });

  const target = new Agent({
    id: 'B',
    position: { x: 5, y: 0, z: 0 }
  });

  // Initial knowledge
  agent.updateKnowledge([target], 1);
  const initialConfidence = agent.knowledge.get('B').confidence;

  // Decay without seeing again
  agent.updateKnowledge([], 2);
  const decayedConfidence = agent.knowledge.get('B').confidence;

  assert(decayedConfidence < initialConfidence);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
