import { serverApi } from './server-api';
import { RescuerAccount } from '../App';

// Simple hash function for passwords (in production, use proper hashing on the server)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
  // Current session stored in memory
  currentSession: null as { userId: string; email: string } | null,

  async signUp(email: string, password: string, metadata?: { name?: string }) {
    try {
      // Check if user already exists
      const existingRescuers = await serverApi.getByPrefix('rescuer:');
      const existingUser = (existingRescuers as RescuerAccount[]).find(r => r.email === email);
      
      if (existingUser) {
        return { 
          data: null, 
          error: { message: 'User already exists' } 
        };
      }

      const userId = crypto.randomUUID();
      const hashedPassword = await hashPassword(password);
      
      // Store user credentials in a separate auth key
      const authKey = `auth:${email}`;
      await serverApi.set(authKey, {
        userId,
        email,
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString()
      });

      // Set current session
      this.currentSession = { userId, email };

      return { 
        data: { 
          user: { id: userId, email } 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message || 'Registration failed' } 
      };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const authKey = `auth:${email}`;
      const authData = await serverApi.get(authKey);
      
      if (!authData) {
        return { 
          data: null, 
          error: { message: 'Invalid email or password' } 
        };
      }

      const hashedPassword = await hashPassword(password);
      
      if (authData.passwordHash !== hashedPassword) {
        return { 
          data: null, 
          error: { message: 'Invalid email or password' } 
        };
      }

      // Set current session
      this.currentSession = { userId: authData.userId, email: authData.email };

      return { 
        data: { 
          user: { id: authData.userId, email: authData.email } 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message || 'Login failed' } 
      };
    }
  },

  signOut() {
    this.currentSession = null;
    return Promise.resolve();
  },

  getSession() {
    return this.currentSession;
  }
};
