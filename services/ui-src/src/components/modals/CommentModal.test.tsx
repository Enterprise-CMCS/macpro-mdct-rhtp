import { MockedFunction } from "vitest";
import { CommentModal, ReportCommentModal } from "./CommentModal";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { testA11yAct } from "utils/testing/commonTests";
import {
  AttachmentStatus,
  InitiativeAnswerProp,
  Comment,
  CommentType,
  ReportStatus,
} from "@rhtp/shared";
import { acceptReport, releaseReport, useStore } from "utils";
import {
  mockAdminUserStore,
  mockHelpDeskUserStore,
  mockUseStore,
} from "utils/testing/setupTest";
import { useFlags } from "launchdarkly-react-client-sdk";
import { mockReport } from "utils/testing/mockForm";

const mockGetComments = vi.fn().mockResolvedValue([
  {
    contextId: "mockContextId",
    created: 123456,
    id: "mockId",
    author: "Mock Author",
    authorEmail: "mockEmail",
    isInternal: false,
    comment: "Mock comment",
    type: CommentType.ATTACHMENT,
    parentReportId: "mockReportId",
  } as Comment,
]);

const mockCreateComment = vi.fn().mockResolvedValue({
  contextId: "mockContextId",
  created: 123456,
  id: "mockId",
  author: "Mock Author",
  authorEmail: "mockEmail",
  isInternal: false,
  comment: "Mock comment",
} as Comment);

vi.mock("utils/api/requestMethods/commentMethods", () => ({
  getComments: (contextId: string, state: string) =>
    mockGetComments(contextId, state),
  createComment: (contextId: string, state: string, bodyParams: any) =>
    mockCreateComment(contextId, state, bodyParams),
}));

vi.mock("utils/state/useStore");
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

vi.mock("launchdarkly-react-client-sdk");
const mockFlags = vi.mocked(useFlags);
mockFlags.mockReturnValue({
  adminCommentsEnabled: true,
});

vi.mock("utils/api/requestMethods/report");
const mockReleaseReport = vi.mocked(releaseReport);
const mockAcceptReport = vi.mocked(acceptReport);

const mockCloseHandler = vi.fn();
const mockUpdateElement = vi.fn();

const mockSelectedFile = {
  name: "test.png",
  size: 100,
  fileId: "testfile123",
};

const mockAllFiles = [
  {
    attachment: mockSelectedFile,
    initiatives: ["test 1", "test 2"],
    status: AttachmentStatus.PENDING_REVIEW,
    canDelete: true,
  },
];

const CommentModalComponent = (
  allFiles: InitiativeAnswerProp[] = mockAllFiles,
  disabled: boolean = false
) => {
  if (disabled) {
    mockedUseStore.mockReturnValue({
      ...mockUseStore,
      report: {
        ...mockUseStore.report,
        status: "Submitted",
      },
    });
  }
  return (
    <CommentModal
      modalDisclosure={{
        isOpen: true,
        onClose: mockCloseHandler,
      }}
      selectedFile={mockSelectedFile}
      updateElement={mockUpdateElement}
      allFiles={allFiles}
    />
  );
};

const renderCommentModal = async () => {
  render(CommentModalComponent());
  await waitFor(() => expect(mockGetComments).toHaveBeenCalled());
};

describe("CommentModal component", () => {
  describe("with no comments", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetComments.mockResolvedValueOnce([]);
      await renderCommentModal();
    });

    test("shows the contents", () => {
      expect(
        screen.getByRole("heading", { name: "Add Comment to test.png" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Comment" })
      ).toBeInTheDocument();
    });

    test("Modals close button can be clicked", async () => {
      await userEvent.click(screen.getByText("Close"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
    });

    test("Fill and save comment", async () => {
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      await userEvent.type(commentInput, "Test comment");
      await userEvent.click(screen.getByText("Save"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
      expect(mockCreateComment).toHaveBeenCalledWith(
        mockSelectedFile.fileId,
        "PA",
        {
          comment: "Test comment",
          type: "attachment",
          parentReportId: mockUseStore.report?.id,
        }
      );
    });
  });

  describe("with previous comments", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetComments.mockResolvedValueOnce([
        {
          contextId: "mockContextId",
          created: 123456,
          id: "mockId",
          author: "CMS User",
          authorEmail: "mockEmail",
          isInternal: false,
          comment: "",
          statusChange: AttachmentStatus.PENDING_REVIEW,
        },
        {
          contextId: "mockContextId",
          created: 123456,
          id: "mockId",
          author: "CMS User",
          authorEmail: "mockEmail",
          isInternal: false,
          comment: "Second comment from cms user",
        },
        {
          contextId: "mockContextId",
          created: 123456,
          id: "mockId",
          author: "CMS User",
          authorEmail: "mockEmail",
          isInternal: false,
          comment: "First comment from cms user",
        },
      ] as Comment[]);

      await renderCommentModal();
    });

    test("Shows previous comments and status changes", async () => {
      const previousComments = screen.getAllByRole("textbox");
      expect(previousComments).toHaveLength(3); // one for new comment, two for existing, no textbox for empty comment with status change
      // most recent comment should be first in the list
      expect(previousComments[1]).toHaveValue("Second comment from cms user");
      expect(previousComments[2]).toHaveValue("First comment from cms user");
      expect(
        screen.getByText("Status changed to: Pending Review")
      ).toBeInTheDocument();
    });
  });

  describe("test permissions", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("state user can edit comment box always", async () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      await renderCommentModal();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeEnabled();
    });

    test("state user must leave a comment to submit", async () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      await renderCommentModal();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeEnabled();
      await userEvent.click(screen.getByText("Save"));
      expect(screen.getByText("A comment is required.")).toBeVisible();
    });

    test("state user can edit attachment status to certain options", async () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      await renderCommentModal();
      const statusButton = screen.getAllByLabelText("Status")[1];
      await userEvent.click(statusButton);
      expect(
        screen.queryByRole("option", { name: "Needs Revision" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Locked for Scoring" })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Pending Review" })
      ).toBeVisible();
      expect(
        screen.getByRole("option", { name: "Informational" })
      ).toBeVisible();
      expect(screen.getByRole("option", { name: "Archived" })).toBeVisible();
    });

    test("admin user can edit when flag true", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      await renderCommentModal();
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeEnabled();
    });

    test("admin user cannot edit when flag false", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: false,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      await renderCommentModal();
      await waitFor(() => expect(mockGetComments).toHaveBeenCalled());
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeDisabled();
    });

    test("other users can never edit", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockHelpDeskUserStore);
      await renderCommentModal();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeDisabled();
    });

    test("cannot add comments when disabled", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockUseStore); // state user
      render(CommentModalComponent(mockAllFiles, true)); // set disabled true
      await waitFor(() => expect(mockGetComments).toHaveBeenCalled());
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeDisabled();
    });

    test("admin user can edit attachment status", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue({
        ...mockUseStore,
        ...mockAdminUserStore,
      });
      await renderCommentModal();
      const statusButton = screen.getAllByLabelText("Status")[1];
      await userEvent.click(statusButton);
      await userEvent.click(
        screen.getByRole("option", { name: "Needs Revision" })
      );
      await userEvent.click(screen.getByText("Save"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
      expect(mockCreateComment).toHaveBeenCalledWith(
        mockSelectedFile.fileId,
        "PA",
        {
          comment: "",
          type: "attachment",
          parentReportId: mockUseStore.report?.id,
          statusChange: AttachmentStatus.NEEDS_REVISION,
        }
      );
      expect(mockUpdateElement).toHaveBeenCalledWith(
        expect.objectContaining({
          answer: expect.arrayContaining([
            expect.objectContaining({
              status: AttachmentStatus.NEEDS_REVISION,
            }),
          ]),
        })
      );
    });
  });

  testA11yAct(CommentModalComponent());
});

const mockReloadReports = vi.fn();

const ReportCommendModalComponent = (report = mockReport) => (
  <ReportCommentModal
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
    selectedReport={report}
    reloadReports={mockReloadReports}
  />
);
describe("ReportCommentModal component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("unsubmitted report", () => {
    beforeEach(() => {
      render(ReportCommendModalComponent());
    });
    test("shows the contents", () => {
      expect(
        screen.getByRole("heading", {
          name: `Add comment to ${mockReport.name}`,
        })
      ).toBeInTheDocument();
      expect(screen.getAllByLabelText("Status")[1]).toBeInTheDocument();
    });

    test("Modals close button can be clicked", async () => {
      await userEvent.click(screen.getByText("Close"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
    });

    test("Status dropdown disabled for unsubmitted report", async () => {
      const statusDropdown = screen.getAllByLabelText("Status")[1];
      expect(statusDropdown).toBeDisabled();
    });
  });
  describe("submitted report", () => {
    const mockSubmittedReport = {
      ...mockReport,
      status: ReportStatus.SUBMITTED,
    };
    beforeEach(() => {
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      render(ReportCommendModalComponent(mockSubmittedReport));
    });

    test("Admin can release a submitted report", async () => {
      const statusDropdown = screen.getAllByLabelText("Status")[1];
      expect(statusDropdown).toBeEnabled();
      await userEvent.click(statusDropdown);
      await userEvent.click(screen.getByRole("option", { name: "Unlock" }));
      await userEvent.click(screen.getByText("Save"));
      expect(mockReleaseReport).toHaveBeenCalled();
      expect(mockReloadReports).toHaveBeenCalled();
    });

    test("Admin can accept a submitted report", async () => {
      const statusDropdown = screen.getAllByLabelText("Status")[1];
      expect(statusDropdown).toBeEnabled();
      await userEvent.click(statusDropdown);
      await userEvent.click(screen.getByRole("option", { name: "Accepted" }));
      await userEvent.click(screen.getByText("Save"));
      expect(mockAcceptReport).toHaveBeenCalled();
      expect(mockReloadReports).toHaveBeenCalled();
    });
  });

  testA11yAct(CommentModalComponent());
});
