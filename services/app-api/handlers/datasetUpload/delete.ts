import { handler } from "../../libs/handler-lib";
import { parseDataSetFileUploadDownloadParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { deleteUpload, queryUpload } from "../../storage/datasetUpload";

export const deleteDataSetUpload = handler(
  parseDataSetFileUploadDownloadParameters,
  async (request) => {
    const { state, id, fileId } = request.parameters;

    // Get file, check aws filename before deleting
    const results = await queryUpload(fileId, state);
    if (!results.Items || results.Items.length === 0) {
      throw new Error("Unauthorized");
    }
    const document = results.Items[0];

    await deleteUpload(fileId, state, id, document);
    return ok();
  }
);
