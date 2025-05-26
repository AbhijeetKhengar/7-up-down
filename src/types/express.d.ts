import { Request } from 'express';

// Define the structure of the user object
export interface AuthenticatedUser {
  id: number;
  email: string;
  [key: string]: any; // Add extra properties if needed
}

// Extend the Express Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    token?: string;
    loginId?: string;
    user_key?: string;
    user_agent?: string;
  }
}
