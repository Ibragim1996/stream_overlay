// app/api/profile/route.ts
import { NextRequest } from 'next/server';
import { userDB, type UserProfile } from '@/lib/user-db';
import { withAuth, withPremiumAuth } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/profile - Get user profile
export const GET = withAuth(async (req) => {
  const user = req.user;
  
  return new Response(JSON.stringify({
    ok: true,
    profile: user.profile || {
      category: 'just_chatting',
      tone: 'funny',
      slangLevel: 5,
      language: 'en',
      voice: 'ash'
    },
    premium: user.premium
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// POST /api/profile - Update user profile (Premium only)
export const POST = withPremiumAuth(async (req) => {
  try {
    const body = await req.json();
    const user = req.user;
    
    const profile: UserProfile = {
      category: body.category || 'just_chatting',
      tone: body.tone || 'funny',
      slangLevel: Math.max(0, Math.min(10, body.slangLevel || 5)),
      language: body.language || 'en',
      voice: body.voice || 'ash'
    };
    
    // Validate voice
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash'];
    if (!validVoices.includes(profile.voice)) {
      profile.voice = 'ash';
    }
    
    // Validate tone
    const validTones = ['funny', 'serious', 'chill', 'street'];
    if (!validTones.includes(profile.tone)) {
      profile.tone = 'funny';
    }
    
    // Validate category
    const validCategories = ['gaming', 'irl', 'just_chatting', 'other'];
    if (!validCategories.includes(profile.category)) {
      profile.category = 'just_chatting';
    }
    
    // Update user profile
    userDB.updateUser(user.id, { profile });
    
    return new Response(JSON.stringify({
      ok: true,
      profile,
      message: 'Profile updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'Invalid profile data'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
