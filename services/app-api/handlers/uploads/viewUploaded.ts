import { handler } from "../../libs/handler-lib";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { queryViewUpload } from "../../storage/upload";
import { ok } from "../../libs/response-lib";
import { UploadFileData } from "../../types/uploads";
/**
 * Updates the Sections associated with a given year and state
 */
export const viewUploaded = handler(
  parseUploadViewParameters,
  async (request) => {
    const { body } = request;
    const { uploadId } = body as UploadFileData;
    const { state, year } = request.parameters;

    const fileId = `${year}-${uploadId}`;
    const uploads = await queryViewUpload(fileId, state);
    return ok({Items: uploads});
  },
);
