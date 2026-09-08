import { handler } from "../../libs/handler-lib";
import { parseDataSetFileUploadDownloadParameters } from "../../dataSets/libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload } from "../../storage/datasetUpload";
import { UploadFileData } from "../../types/uploads";

export const updateDataSet = handler(
  parseDataSetFileUploadDownloadParameters,
  async (request) => {
    const { user, body } = request;
    const { state, id: datasetId, fileId } = request.parameters;
    const { uploadedFileName, uploadedFileSize } = body as UploadFileData;
    const username = user.email ?? "";

    await updateUpload(
      state,
      username,
      uploadedFileName,
      fileId,
      datasetId,
      uploadedFileSize
    );
    return ok(body);
  }
);
