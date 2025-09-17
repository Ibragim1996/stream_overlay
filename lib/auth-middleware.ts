// lib/auth-middleware.ts
import { NextRequest } from 'next/server';
import { userDB, type User } from './user-db';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

// Extract user ID from various sources
export function extractUserId(req: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Try query parameter
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || url.searchParams.get('token');
  if (token) {
    return token;
  }
  
  return null;
}

// Middleware function to add user to request
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const userId = extractUserId(req);
    
    // If no userId found, create a default user
    const finalUserId = userId || 'default-user';
    const user = userDB.getUser(finalUserId);
    (req as AuthenticatedRequest).user = user;
    
    return handler(req as AuthenticatedRequest);
  };
}

// Premium-only middleware
export function withPremiumAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user.premium) {
      return new Response(JSON.stringify({ 
        error: 'Premium subscription required',
        code: 'PREMIUM_REQUIRED'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return handler(req);
  });
}
