import { Router } from 'itty-router';
import { apiRoutes } from './routes/api';

// Create router
const router = Router();

// Health check
router.get('/health', () => {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

// API documentation
router.get('/api', () => {
  return Response.json({
    version: 'v1',
    title: 'Constraint Theory API',
    description: 'RESTful API for constraint theory computations and simulations',
    baseUrl: '/api',
    endpoints: {
      health: 'GET /health',
      docs: 'GET /api',
      snap: 'POST /api/geometry/snap',
      solve: 'POST /api/constraints/solve',
      validate: 'POST /api/constraints/validate',
    },
  });
});

// Mount API routes
router.route('/api', apiRoutes);

// Root endpoint
router.get('/', () => {
  return Response.json({
    name: 'Constraint Theory API',
    version: 'v1',
    status: 'operational',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api',
    },
  });
});

// 404 handler
router.all('*', () => {
  return Response.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    documentation: '/api'
  }, { status: 404 });
});

// Export for Cloudflare Workers
export interface Env {
  ENVIRONMENT?: string;
  API_VERSION?: string;
  CORS_ORIGIN?: string;
  // KV namespaces (optional - add these in Cloudflare dashboard first)
  // SESSION_STORE?: KVNamespace;
  // CACHE?: KVNamespace;
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request).catch(err => {
      console.error('Unhandled error:', err);
      return Response.json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }, { status: 500 });
    })
};
