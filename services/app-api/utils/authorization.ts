import { User, UserRoles } from "../types/types";
import { StateAbbr } from "./constants";

/** These roles are allowed to read data for any state */
const statelessRoles = [
  UserRoles.ADMIN,
  UserRoles.APPROVER,
  UserRoles.HELP_DESK,
  UserRoles.INTERNAL,
];

export const canReadState = (user: User, state: StateAbbr) => {
  if (statelessRoles.includes(user.role)) {
    return true;
  }
  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canWriteState = (user: User, state: StateAbbr) => {
  // TODO: For the first year, Admins will be entering data manually for the states
  // Remove the check below this when we want to stop allowing Admins to create/edit reports.
  if (user.role == UserRoles.ADMIN) return true;

  if (user.role == UserRoles.STATE_USER && user.state === state) {
    return true;
  }
  return false;
};

export const canWriteBanner = (user: User) => {
  return user.role == UserRoles.ADMIN;
};

export const canArchiveReport = (user: User) => {
  return [UserRoles.ADMIN, UserRoles.APPROVER].includes(user.role);
};

export const canReleaseReport = (user: User) => {
  return [UserRoles.ADMIN, UserRoles.APPROVER].includes(user.role);
};

export const canDeleteUpload = (user: User) => {
  return user.role == UserRoles.STATE_USER;
};
