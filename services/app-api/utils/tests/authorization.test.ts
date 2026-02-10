import { canReadState, canWriteBanner, canWriteState } from "../authorization";
import { User, UserRoles } from "../../types/types";

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
    test("should allow admins", () => {
      expect(canReadState(adminUser, "CO")).toBe(true);
    });

    test("should allow state users to read their own state", () => {
      expect(canReadState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to read other states", () => {
      expect(canReadState(stateUser, "TX")).toBe(false);
    });
  });

  describe("canWriteBanners", () => {
    test("should forbid admins", () => {
      expect(canWriteState(adminUser, "CO")).toBe(false);
    });

    test("should allow state users to read their own state", () => {
      expect(canWriteState(stateUser, "CO")).toBe(true);
    });

    test("should forbid state users to read other states", () => {
      expect(canWriteState(stateUser, "TX")).toBe(false);
    });
  });

  describe("canWriteBanner", () => {
    test("should ONLY allow admins, forbid others", () => {
      expect(canWriteBanner(adminUser)).toBe(true);

      expect(canWriteBanner(approverUser)).toBe(false);
      expect(canWriteBanner(stateUser)).toBe(false);
      expect(canWriteBanner(helpDeskUser)).toBe(false);
      expect(canWriteBanner(internalUser)).toBe(false);
    });
  });
});
