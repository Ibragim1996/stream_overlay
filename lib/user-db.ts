// lib/user-db.ts
export interface UserProfile {
  category: string;
  tone: string;
  slangLevel: number; // 0-10
  language: string;
  voice: string;
}

export interface User {
  id: string;
  premium: boolean;
  profile?: UserProfile;
  counters: {
    tasksUsed: number;
    lastReset: number; // timestamp
  };
  lastReactionTime?: number; // for cooldown
}

// In-memory database
class UserDB {
  private users: Map<string, User> = new Map();
  private readonly HOUR_MS = 60 * 60 * 1000;

  // Get or create user
  getUser(userId: string): User {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        premium: false,
        counters: {
          tasksUsed: 0,
          lastReset: Date.now()
        }
      });
    }
    return this.users.get(userId)!;
  }

  // Update user
  updateUser(userId: string, updates: Partial<User>): User {
    const user = this.getUser(userId);
    const updatedUser = { ...user, ...updates };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Check if user can use tasks (rate limiting)
  canUseTask(userId: string): boolean {
    const user = this.getUser(userId);
    
    // Premium users have unlimited access
    if (user.premium) return true;
    
    // Check if hour has passed, reset counter
    const now = Date.now();
    if (now - user.counters.lastReset > this.HOUR_MS) {
      user.counters.tasksUsed = 0;
      user.counters.lastReset = now;
      this.users.set(userId, user);
    }
    
    // Check if under limit
    return user.counters.tasksUsed < 10;
  }

  // Increment task usage
  incrementTaskUsage(userId: string): void {
    const user = this.getUser(userId);
    if (!user.premium) {
      user.counters.tasksUsed++;
      this.users.set(userId, user);
    }
  }

  // Check reaction cooldown
  canReact(userId: string): boolean {
    const user = this.getUser(userId);
    if (!user.lastReactionTime) return true;
    
    const now = Date.now();
    const cooldownMs = 5 * 1000; // 5 seconds
    return now - user.lastReactionTime > cooldownMs;
  }

  // Set reaction time
  setReactionTime(userId: string): void {
    const user = this.getUser(userId);
    user.lastReactionTime = Date.now();
    this.users.set(userId, user);
  }

  // Get all users (for debugging)
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}

export const userDB = new UserDB();
