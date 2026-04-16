// Types for Clerk auth session shape (used by getAuthSession utility)
export interface AuthUser {
  id: number;
  clerkId: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
}
