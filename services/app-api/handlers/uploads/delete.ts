import { handler } from "../../libs/handler-lib";
import { parseUploadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { deleteUpload, queryUpload } from "../../storage/upload";

export const deleteUploadedFile = handler(
  parseUploadParameters,
  async (request) => {
    const { state, reportType, id, fileId } = request.parameters;

    // Get file, check aws filename before deleting
    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(fileId, state, reportType, id, document);
    return ok();
  }
);
