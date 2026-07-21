import { randomUUID } from "node:crypto";
import { handler } from "../../libs/handler-lib";
import { parseCommentPathParams } from "../../libs/param-lib";
import { badRequest, created, forbidden } from "../../libs/response-lib";
import { putComment } from "../../storage/comments";
import { canWriteComments } from "../../utils/authorization";
import { logger } from "../../libs/debug-lib";
import { validateCommentPayload } from "../../utils/reportValidation";
import { error } from "../../utils/constants";
import {
  AttachmentStatus,
  Comment,
  CommentType,
  ReportType,
} from "@rhtp/shared";
import {
  sendAttachmentCommentEmail,
  sendAttachmentStatusChangeEmail,
  sendReportCommentEmail,
} from "../../utils/notifications/email";
import { getReport } from "../../storage/reports";

export const createComment = handler(
  parseCommentPathParams,
  async (request) => {
    const { contextId, state } = request.parameters;
    const { user, body } = request;

    if (!canWriteComments(user, state)) {
      return forbidden(error.UNAUTHORIZED);
    }

    const comment = {
      ...body,
      contextId,
      created: Date.now(),
      id: randomUUID(),
      author: user.fullName,
      authorEmail: user.email,
    } as Comment;
    let validatedComment;
    try {
      validatedComment = await validateCommentPayload(comment);
    } catch (error) {
      logger.error(error);
      return badRequest("Invalid request");
    }

    await putComment(validatedComment);

    if (
      comment.type === CommentType.REPORT &&
      !comment.isInternal &&
      comment.comment
    ) {
      const report = await getReport(ReportType.RHTP, state, contextId);
      if (report) {
        await sendReportCommentEmail(report, user);
      }
    }

    // New external comment on an attachment
    if (
      comment.type === CommentType.ATTACHMENT &&
      !comment.isInternal &&
      comment.parentReportId &&
      comment.comment
    ) {
      const report = await getReport(
        ReportType.RHTP,
        state,
        comment.parentReportId
      );
      if (report) {
        await sendAttachmentCommentEmail(report, user, comment);
      }
    }

    // Email-triggering status change on an attachment
    if (
      comment.type === CommentType.ATTACHMENT &&
      comment.parentReportId &&
      (comment.statusChange === AttachmentStatus.LOCKED_FOR_SCORING ||
        comment.statusChange === AttachmentStatus.NEEDS_REVISION)
    ) {
      const report = await getReport(
        ReportType.RHTP,
        state,
        comment.parentReportId
      );
      if (report) {
        await sendAttachmentStatusChangeEmail(report, user, comment);
      }
    }

    return created(validatedComment);
  }
);
