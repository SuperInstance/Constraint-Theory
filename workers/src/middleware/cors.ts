interface Env {
  CORS_ORIGIN: string;
}

export const corsMiddleware = async (request: Request, env: Env) => {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.CORS_ORIGIN.split(',');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const allowedOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    return new Response(null, { headers: corsHeaders });
  }

  // Add CORS headers to response
  const allowedOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];
  request.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  request.headers.set('Access-Control-Allow-Credentials', 'true');
};
