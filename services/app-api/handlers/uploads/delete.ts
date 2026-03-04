import { handler } from "../../libs/handler-lib";
import { parseUploadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { deleteUpload, queryUpload } from "../../storage/upload";

export const deleteUploadFile = handler(
  parseUploadParameters,
  async (request) => {
    const { user } = request;
    const { state, fileId } = request.parameters;

    const decodedFileId = decodeURIComponent(fileId);
    // Get file, check aws filename before deleting
    const results = await queryUpload(decodedFileId, state!);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(decodedFileId, state!, document);
    return ok();
  }
);
