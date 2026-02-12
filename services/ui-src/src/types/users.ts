// USERS

// TODO: change to mdctrhtp
export enum UserRoles {
  ADMIN = "mdcthcbs-bor", // "MDCT RHTP Business Owner Representative"
  APPROVER = "mdcthcbs-appr", // "MDCT RHTP Approver"
  HELP_DESK = "mdcthcbs-hd", // "MDCT RHTP Help Desk"
  INTERNAL = "mdcthcbs-internal-user", // "MDCT RHTP Internal User"
  STATE_USER = "mdcthcbs-state-user", // "MDCT RHTP State User"
}

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
