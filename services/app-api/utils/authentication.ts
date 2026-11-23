import { APIGatewayProxyEvent, User } from "../types/types";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { isStateAbbr, isUserRole } from "@rhtp/shared";
import { logger } from "../libs/debug-lib";

export interface DecodedToken {
  "custom:cms_roles"?: string;
  "custom:cms_state"?: string;
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Extract user information from the event's auth headers.
 *
 * Returns `undefined` if the headers are invalid.
 */
export const authenticatedUser = async (
  event: APIGatewayProxyEvent
): Promise<User | undefined> => {
  const apiKey = event.headers?.["x-api-key"];
  if (!apiKey) {
    return undefined;
  }

  const token = await verifyAndParseToken(apiKey);
  if (!token) {
    return undefined;
  }

  logger.debug(`Requesting user has sub '${token.sub}'`);
  return parseUserFromToken(token);
};

/** Verify the signature on the JWT */
const verifyAndParseToken = async (apiKey: string | undefined) => {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    tokenUse: "id",
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
  });

  try {
    return await verifier.verify(apiKey!);
  } catch {
    return undefined;
  }
};

export const parseUserFromToken = (token: DecodedToken) => {
  return {
    role: parseRoleFromToken(token),
    state: parseStateFromToken(token),
    /*
     * We expect email to always be present & valid for all users,
     * even though email_verified is not always true for our test users.
     */
    email: token.email as string,
    fullName: parseFullNameFromToken(token),
  };
};

const parseRoleFromToken = (token: DecodedToken) => {
  if (!("custom:cms_roles" in token)) {
    throw new Error(`Token is missing key "custom:cms_roles"`);
  }
  const rolesString = token["custom:cms_roles"] as string;
  const role = rolesString.split(",").find(isUserRole);
  if (!role) {
    throw new Error(`No RHTP role defined: ${rolesString}`);
  }
  return role;
};

const parseStateFromToken = (token: DecodedToken) => {
  if (!("custom:cms_state" in token)) {
    return undefined;
  }
  const state = token["custom:cms_state"] as string;
  if (!isStateAbbr(state)) {
    throw new Error(`Invalid state abbreviation: ${state}`);
  }
  return state;
};

const parseFullNameFromToken = (token: DecodedToken) => {
  return [token["given_name"], token["family_name"]]
    .filter((name) => !!name)
    .join(" ");
};
