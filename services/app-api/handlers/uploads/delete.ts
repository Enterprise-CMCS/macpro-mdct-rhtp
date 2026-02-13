import { handler } from "../../libs/handler-lib";
import { canDeleteUpload } from "../../utils/authorization";
import { error } from "../../utils/constants";
import { parseUploadParameters } from "../../libs/param-lib";
import { forbidden, ok } from "../../libs/response-lib";
import { deleteUpload, queryUpload } from "../../storage/upload";

/**
 * Returns the report Sections associated with a given year and state
 */
export const deleteUploadFile = handler(
  parseUploadParameters,
  async (request) => {
    const { user } = request;
    const { state, fileId } = request.parameters;

    if (!canDeleteUpload(user)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const decodedFileId = decodeURIComponent(fileId);
    // Get file, check aws filename before deleting
    const results = await queryUpload(decodedFileId, state!);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(decodedFileId, state!, document);
    return ok();
  },
);
