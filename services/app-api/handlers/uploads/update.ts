import { handler } from "../../libs/handler-lib";
import { parseUploadViewParameters } from "../../libs/param-lib";
import { ok } from "../../libs/response-lib";
import { updateUpload2 } from "../../storage/upload";

export const updateUploads = handler(
  parseUploadViewParameters,
  async (request) => {
    const { body } = request;
    const { fileId, initiative } = body as any;

    const { state } = request.parameters;
    await updateUpload2(state, fileId, initiative);

    return ok();
  }
);
