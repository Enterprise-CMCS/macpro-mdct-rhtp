export enum UserRoles {
  ADMIN = "mdctrhtp-bor", // "MDCT RHTP Business Owner Representative"
  APPROVER = "mdctrhtp-approver", // "MDCT RHTP Approver"
  HELP_DESK = "mdctrhtp-help-desk", // "MDCT RHTP Help Desk"
  INTERNAL = "mdctrhtp-internal-user", // "MDCT RHTP Internal User"
  STATE_USER = "mdctrhtp-state-user", // "MDCT RHTP State User",
  PROJECT_OFFICER = "mdctrhtp-project-officer", // "MDCT RHTP Project Officer"
}
export const isUserRole = (role: string): role is UserRoles => {
  return Object.values(UserRoles).includes(role as UserRoles);
};
