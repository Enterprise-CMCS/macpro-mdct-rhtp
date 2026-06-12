import { MockedFunction } from "vitest";
import { ReportCommentDrawer } from "./ReportCommentDrawer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { testA11yAct } from "utils/testing/commonTests";
import { Comment, CommentType, ReportStatus } from "@rhtp/shared";
import { acceptReport, releaseReport, useStore } from "utils";
import { mockAdminUserStore, mockUseStore } from "utils/testing/setupTest";
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

const mockReloadReports = vi.fn();

const ReportCommentDrawerComponent = (report = mockReport) => (
  <ReportCommentDrawer
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
    selectedReport={report}
    reloadReports={mockReloadReports}
  />
);
describe("ReportCommentDrawer component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("unsubmitted report", () => {
    beforeEach(() => {
      render(ReportCommentDrawerComponent());
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
      render(ReportCommentDrawerComponent(mockSubmittedReport));
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

  testA11yAct(ReportCommentDrawerComponent());
});
