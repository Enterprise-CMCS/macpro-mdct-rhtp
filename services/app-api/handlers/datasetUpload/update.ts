import { handler } from "../../libs/handler-lib";
import { parseDataSetFileUploadDownloadParameters } from "../../dataSets/libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/datasetUpload";

export const updateDataSetUpload = handler(
  parseDataSetFileUploadDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId, fileId } = request.parameters;
    const { filename, filesize } = body as any;
    const username = user.email ?? "";

    await updateUpload(state, username, filename, fileId, datasetId, filesize);
    return ok(body);
  }
);
