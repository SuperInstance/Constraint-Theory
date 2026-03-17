// Tutorial routes for Cloudflare Workers
import { Router } from 'itty-router';

export const tutorialsRoutes = Router();

// Tutorial metadata
const TUTORIALS_META = `
{
  "tutorials": [
    {
      "id": "pythagorean-snapping",
      "title": "Pythagorean Snapping",
      "category": "Geometric Constraints",
      "difficulty": "beginner",
      "duration": "15 minutes",
      "description": "Learn how vectors snap to integer Pythagorean ratios through geometric constraints",
      "steps": 12
    },
    {
      "id": "rigidity-matroid",
      "title": "Rigidity Matroid Theory",
      "category": "Graph Theory",
      "difficulty": "intermediate",
      "duration": "20 minutes",
      "description": "Discover Laman's theorem and rigidity matroids through interactive graph visualization",
      "steps": 15
    }
  ],
  "progressTracking": {
    "enabled": true,
    "localStorage": "constraintTheory_tutorial_progress",
    "achievements": [
      {
        "id": "first_tutorial",
        "title": "First Steps",
        "description": "Complete your first tutorial",
        "icon": "🎯"
      },
      {
        "id": "completionist",
        "title": "Completionist",
        "description": "Complete all tutorials",
        "icon": "🏆"
      },
      {
        "id": "perfect_score",
        "title": "Perfect Score",
        "description": "Get 100% on all quizzes",
        "icon": "⭐"
      },
      {
        "id": "explorer",
        "title": "Explorer",
        "description": "Try all simulators",
        "icon": "🧭"
      }
    ]
  }
}
`;

// Tutorial content for Pythagorean Snapping
const PYTHAGOREAN_TUTORIAL = `
{
  "id": "pythagorean-snapping",
  "title": "Pythagorean Snapping",
  "steps": [
    {
      "step": 1,
      "title": "Introduction to Geometric Snapping",
      "content": "# Geometric Snapping\\n\\nGeometric snapping is a fundamental concept in constraint theory where continuous values are forced to align with discrete geometric constraints.\\n\\n## Why Snapping Matters\\n\\nIn computational geometry and constraint systems, we often need to:\\n\\n- **Discretize continuous space** - Convert smooth mathematical spaces into discrete, computable values\\n- **Enforce integer constraints** - Ensure coordinates and dimensions satisfy specific integer relationships\\n- **Maintain geometric validity** - Preserve mathematical properties like Pythagorean relationships\\n- **Enable efficient computation** - Work with exact integer arithmetic rather than approximate floating-point"
    }
  ]
}
`;

// Tutorial content for Rigidity Matroid
const RIGIDITY_TUTORIAL = `
{
  "id": "rigidity-matroid",
  "title": "Rigidity Matroid Theory",
  "steps": [
    {
      "step": 1,
      "title": "Introduction to Graph Rigidity",
      "content": "# Graph Rigidity\\n\\nRigidity theory studies when geometric structures defined by graphs and edge lengths are rigid or flexible in space.\\n\\n## The Fundamental Question\\n\\n> **When does a graph with specified edge lengths have only finitely many realizations in the plane?**"
    }
  ]
}
`;

// Serve tutorial metadata
tutorialsRoutes.get('/data/tutorials.json', () => {
  return new Response(TUTORIALS_META, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Serve Pythagorean tutorial content
tutorialsRoutes.get('/data/pythagorean-snapping.json', () => {
  return new Response(PYTHAGOREAN_TUTORIAL, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Serve Rigidity tutorial content
tutorialsRoutes.get('/data/rigidity-matroid.json', () => {
  return new Response(RIGIDITY_TUTORIAL, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});
