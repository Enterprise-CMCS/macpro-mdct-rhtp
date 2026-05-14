import { SESClient, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";
import { handler } from "../../libs/handler-lib";
import { ok } from "../../libs/response-lib";

const client = new SESClient({ region: "us-east-1" });
const FROM_ADDRESS = "garrett.rabian@coforma.io";

export const verifyEmail = handler(
  (a) => a,
  async () => {
    const verificationCommand = new VerifyEmailIdentityCommand({
      EmailAddress: FROM_ADDRESS,
    });
    const response = await client.send(verificationCommand);
    return ok(response);
  }
);
