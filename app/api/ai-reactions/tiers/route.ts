import { NextResponse } from 'next/server';

const TIERS = {
  BASIC: { 
    price: 299, 
    durSec: '5-10', 
    chain: ['one_liner'],
    enabled: true
  },
  MEDIUM: { 
    price: 999, 
    durSec: '20-30', 
    chain: ['multi_punch_3', 'coach_mode'],
    enabled: false
  },
  VIP: { 
    price: 4999, 
    durSec: '45-60', 
    chain: ['battle', 'crowd_fx', 'epic_motivation'],
    enabled: false
  }
};

const STYLES = {
  support: {
    name: 'Supportive',
    description: 'Encouraging and positive reactions',
    emoji: '😊'
  },
  light_troll: {
    name: 'Light Troll',
    description: 'Playful teasing and jokes',
    emoji: '😏'
  },
  hard_troll: {
    name: 'Hard Troll', 
    description: 'Sharp criticism and tough love',
    emoji: '😈'
  }
};

export async function GET() {
  return NextResponse.json({
    tiers: TIERS,
    styles: STYLES
  });
}


