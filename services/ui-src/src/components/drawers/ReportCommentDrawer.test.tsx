import { MockedFunction } from "vitest";
import { ReportCommentDrawer } from "./ReportCommentDrawer";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { testA11yAct } from "utils/testing/commonTests";
import { Comment, CommentType, ReportStatus } from "@rhtp/shared";
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
    type: CommentType.REPORT,
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

const ReportCommentDrawerComponent = (report = mockReport) => (
  <ReportCommentDrawer
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
    selectedReport={report}
  />
);

const renderReportCommentDrawerComponent = async (report = mockReport) => {
  render(ReportCommentDrawerComponent(report));
  await waitFor(() => expect(mockGetComments).toHaveBeenCalled());
};
describe("ReportCommentDrawer component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseStore.mockReturnValue(mockAdminUserStore);
  });
  describe("unsubmitted report", () => {
    beforeEach(async () => {
      await renderReportCommentDrawerComponent();
    });
    test("shows the contents", () => {
      expect(
        screen.getByRole("heading", {
          name: "Add comment to report",
        })
      ).toBeInTheDocument();
      expect(screen.getAllByLabelText("Status")[1]).toBeInTheDocument();
    });

    test("Modals close button can be clicked", async () => {
      await userEvent.click(screen.getAllByText("Close")[0]);
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
    beforeEach(async () => {
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      await renderReportCommentDrawerComponent(mockSubmittedReport);
    });

    test("Admin can release a submitted report", async () => {
      const statusDropdown = screen.getAllByLabelText("Status")[1];
      expect(statusDropdown).toBeEnabled();
      await userEvent.click(statusDropdown);
      await userEvent.click(screen.getByRole("option", { name: "Unlock" }));
      await userEvent.click(screen.getByText("External (Shared with States)"));
      await userEvent.click(screen.getByText("Add comment"));
      expect(mockReleaseReport).toHaveBeenCalled();
    });

    test("Admin can accept a submitted report", async () => {
      const statusDropdown = screen.getAllByLabelText("Status")[1];
      expect(statusDropdown).toBeEnabled();
      await userEvent.click(statusDropdown);
      await userEvent.click(screen.getByRole("option", { name: "Accepted" }));
      await userEvent.click(screen.getByText("External (Shared with States)"));
      await userEvent.click(screen.getByText("Add comment"));
      expect(mockAcceptReport).toHaveBeenCalled();
    });
  });

  describe("Comment functionality", () => {
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
            statusChange: ReportStatus.ACCEPTED,
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

        await renderReportCommentDrawerComponent();
      });

      test("Shows previous comments and status changes", async () => {
        const previousComments = screen.getAllByRole("textbox");
        expect(previousComments).toHaveLength(3); // one for new comment, two for existing, no textbox for empty comment with status change
        // most recent comment should be first in the list
        expect(previousComments[1]).toHaveValue("Second comment from cms user");
        expect(previousComments[2]).toHaveValue("First comment from cms user");
        expect(
          screen.getByText("Status changed to: Accepted")
        ).toBeInTheDocument();
      });

      test("Fill and save comment", async () => {
        const commentInput = screen.getByRole("textbox", {
          name: "Comment(optional)",
        });
        await userEvent.type(commentInput, "Test comment");
        await userEvent.click(
          screen.getByText("External (Shared with States)")
        );
        await userEvent.click(screen.getByText("Add comment"));
        expect(mockCreateComment).toHaveBeenCalledWith(
          mockReport.id,
          mockReport.state,
          {
            comment: "Test comment",
            type: "report",
            isInternal: false,
          }
        );
      });
    });
  });

  describe("test permissions", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("state user can edit comment box always", async () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeEnabled();
    });

    test("state user must leave a comment to submit", async () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeEnabled();
      await userEvent.click(screen.getByText("Add comment"));
      expect(screen.getByText("A comment is required.")).toBeVisible();
    });

    test("admin user can edit when flag true", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeEnabled();
    });

    test("admin user cannot edit when flag false", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: false,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      await renderReportCommentDrawerComponent();
      await waitFor(() => expect(mockGetComments).toHaveBeenCalled());
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeDisabled();
    });

    test("other users can never edit", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockHelpDeskUserStore);
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeDisabled();
    });

    test("admin user can make internal comments", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue({
        ...mockUseStore,
        ...mockAdminUserStore,
      });
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", {
        name: "Comment(optional)",
      });
      await userEvent.type(commentInput, "Test comment");
      await userEvent.click(screen.getByText("Internal (CMS Only)"));
      await userEvent.click(screen.getByText("Add comment"));
      expect(mockCreateComment).toHaveBeenCalledWith(
        mockReport.id,
        mockReport.state,
        {
          comment: "Test comment",
          type: "report",
          isInternal: true,
        }
      );
    });

    test("admin user gets error if they do not select a comment type", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue({
        ...mockUseStore,
        ...mockAdminUserStore,
      });
      await renderReportCommentDrawerComponent();
      const commentInput = screen.getByRole("textbox", {
        name: "Comment(optional)",
      });
      await userEvent.type(commentInput, "Test comment");
      await userEvent.click(screen.getByText("Add comment"));
      expect(screen.getByText("Please select a comment type.")).toBeVisible();
    });
  });

  testA11yAct(ReportCommentDrawerComponent());
});
