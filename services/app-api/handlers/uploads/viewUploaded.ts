import { handler } from "../../libs/handler-lib";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { queryViewUpload } from "../../storage/upload";
import { ok } from "../../libs/response-lib";
/**
 * Updates the Sections associated with a given year and state
 */
export const viewUploaded = handler(
  parseUploadViewParameters,
  async (request) => {
    const { state } = request.parameters;

    const uploads = await queryViewUpload(state);
    return ok(uploads);
  }
);
