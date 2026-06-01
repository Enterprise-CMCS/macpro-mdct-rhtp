// USERS

export interface User {
  email: string;
  given_name: string;
  family_name: string;
  full_name: string;
  state?: string;
  userRole?: string;
  userIsAdmin?: boolean;
  userIsReadOnly?: boolean;
  userIsEndUser?: boolean;
}

export interface UserContextShape {
  user?: User;
  getExpiration: () => string;
  logout: () => Promise<void>;
  loginWithIDM: () => Promise<void>;
  showLocalLogins?: boolean;
  updateTimeout: () => void;
}
