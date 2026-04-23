import {
  canReadState,
  canReleaseReport,
  canWriteBanner,
  canWriteInitiatives,
  canWriteState,
} from "../authorization";
import { User } from "../../types/types";
import { UserRoles } from "@rhtp/shared";

const adminUser = {
  role: UserRoles.ADMIN,
} as User;

const approverUser = {
  role: UserRoles.APPROVER,
} as User;

const internalUser = {
  role: UserRoles.INTERNAL,
} as User;

const helpDeskUser = {
  role: UserRoles.HELP_DESK,
} as User;

const stateUser = {
  role: UserRoles.STATE_USER,
  state: "CO",
} as User;

describe("Authorization functions", () => {
  describe("canReadState", () => {
    test("should allow all non-state-user roles", () => {
      expect(canReadState(adminUser, "CO")).toBe(true);
      expect(canReadState(approverUser, "CO")).toBe(true);
      expect(canReadState(internalUser, "CO")).toBe(true);
      expect(canReadState(helpDeskUser, "CO")).toBe(true);
    });

    test("should allow state users to read their own state", () => {
      expect(canReadState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to read other states", () => {
      expect(canReadState(stateUser, "TX")).toBe(false);
    });
  });

  describe("canWriteState", () => {
    test("should temporarily allow admin roles", () => {
      expect(canWriteState(adminUser, "CO")).toBe(true);
    });

    test("should allow state users to write their own state", () => {
      expect(canWriteState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to write other states", () => {
      expect(canWriteState(stateUser, "TX")).toBe(false);
    });

    test("should reject other roles", () => {
      expect(canWriteState(approverUser, "CO")).toBe(false);
      expect(canWriteState(internalUser, "CO")).toBe(false);
      expect(canWriteState(helpDeskUser, "CO")).toBe(false);
    });
  });

  describe("canWriteInitiatives", () => {
    test("should allow admins and approvers", () => {
      expect(canWriteInitiatives(adminUser)).toBe(true);
      expect(canWriteInitiatives(approverUser)).toBe(true);
    });

    test("should not allow state users, help desk, and internal users", () => {
      expect(canWriteInitiatives(stateUser)).toBe(false);
      expect(canWriteInitiatives(helpDeskUser)).toBe(false);
      expect(canWriteInitiatives(internalUser)).toBe(false);
    });
  });

  describe("canWriteBanner", () => {
    test("should only allow admins", () => {
      expect(canWriteBanner(adminUser)).toBe(true);
    });

    test("should forbid others", () => {
      expect(canWriteBanner(approverUser)).toBe(false);
      expect(canWriteBanner(stateUser)).toBe(false);
      expect(canWriteBanner(helpDeskUser)).toBe(false);
      expect(canWriteBanner(internalUser)).toBe(false);
    });
  });

  describe("canReleaseReport", () => {
    test("should allow admins and approvers", () => {
      expect(canReleaseReport(adminUser)).toBe(true);
      expect(canReleaseReport(approverUser)).toBe(true);
    });

    test("should not allow state users, help desk, and internal users", () => {
      expect(canReleaseReport(stateUser)).toBe(false);
      expect(canReleaseReport(helpDeskUser)).toBe(false);
      expect(canReleaseReport(internalUser)).toBe(false);
    });
  });
});
