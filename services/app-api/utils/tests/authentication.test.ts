import {
  authenticatedUser,
  parseUserFromToken,
  DecodedToken,
} from "../authentication";
import { proxyEvent } from "../../testing/proxyEvent";
import { UserRoles } from "@rhtp/shared";

const mockVerifier = vi.fn();

vi.mock("aws-jwt-verify", () => ({
  __esModule: true,
  CognitoJwtVerifier: {
    create: vi.fn().mockImplementation(() => ({
      verify: mockVerifier,
    })),
  },
}));

const apiKeyEvent = { ...proxyEvent, headers: { "x-api-key": "test" } };
const mockToken = {
  "custom:cms_roles": "other-role,mdctrhtp-state-user,another-role",
  "custom:cms_state": "CO",
  email_verified: true,
  email: "stateuser@test.com",
  given_name: "Helen Hunt",
  family_name: "Jackson",
} as DecodedToken;

describe("Authentication methods", () => {
  describe("Test authorization with api key and environment variables", () => {
    beforeEach(() => {
      process.env["COGNITO_USER_POOL_ID"] = "fakeId";
      process.env["COGNITO_USER_POOL_CLIENT_ID"] = "fakeClientId";
    });
    afterEach(() => {
      delete process.env.COGNITO_USER_POOL_ID;
      delete process.env.COGNITO_USER_POOL_CLIENT_ID;
      vi.clearAllMocks();
    });

    test("is not authorized when token is missing or invalid", async () => {
      mockVerifier.mockImplementation(() => {
        throw new Error("could not verify");
      });
      const authStatus = await authenticatedUser(apiKeyEvent);
      expect(authStatus).toBeFalsy();
    });
    test("is authorized when api key is passed and environment variables are set", async () => {
      mockVerifier.mockReturnValue(mockToken);
      const authStatus = await authenticatedUser(apiKeyEvent);
      expect(authStatus).toBeTruthy();
    });
  });

  describe("Test authorization with api key", () => {
    beforeEach(() => {
      mockVerifier.mockReturnValue(mockToken);
    });
    afterEach(() => {
      vi.clearAllMocks();
    });
    test("is authorized when api key is passed", async () => {
      const authStatus = await authenticatedUser(apiKeyEvent);
      expect(authStatus).toBeTruthy();
    });
  });

  describe("User token parsing", () => {
    test("should successfully parse a valid token", () => {
      const user = parseUserFromToken(mockToken);

      expect(user).toBeTruthy();
      expect(user.role).toBe(UserRoles.STATE_USER);
      expect(user.email).toBe("stateuser@test.com");
      expect(user.fullName).toBe("Helen Hunt Jackson");
    });

    test("should fail if the roles key is missing", () => {
      const noRoleToken = { ...mockToken };
      delete noRoleToken["custom:cms_roles"];
      expect(() => parseUserFromToken(noRoleToken)).toThrow();
    });

    test("should fail if the role is invalid", () => {
      const badRoleToken = { ...mockToken, "custom:cms_roles": "invalid" };
      expect(() => parseUserFromToken(badRoleToken)).toThrow();
    });

    test("should succeed with no state if user has none", () => {
      const noStateToken = { ...mockToken };
      delete noStateToken["custom:cms_state"];
      const user = parseUserFromToken(noStateToken);
      expect(user.state).toBeUndefined();
    });

    test("should fail if state is invalid", () => {
      const badStateToken = { ...mockToken, "custom:cms_state": "invalid" };
      expect(() => parseUserFromToken(badStateToken)).toThrow();
    });

    test("should omit first name if it is not in the token", () => {
      const noGivenNameToken = { ...mockToken, given_name: undefined };
      const user = parseUserFromToken(noGivenNameToken);
      expect(user.fullName).toBe("Jackson");
    });
  });
});
