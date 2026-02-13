import { handler } from "../../libs/handler-lib";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { queryUpload } from "../../storage/upload";
import { ok } from "../../libs/response-lib";
/**
 * Updates the Sections associated with a given year and state
 */
export const viewUploaded = handler(
  parseUploadViewParameters,
  async (request) => {
    const { state, year } = request.parameters;
    const body = request.body;
    const { questionId } = body as any;

    const fileId = `${year}-${questionId}`;
    const queryValue = await queryUpload(fileId, state);
    return ok(queryValue.Items);
  },
);
