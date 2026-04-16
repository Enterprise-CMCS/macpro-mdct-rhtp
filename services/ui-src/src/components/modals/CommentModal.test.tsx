import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentModal } from "./CommentModal";
import userEvent from "@testing-library/user-event";
import { testA11y } from "utils/testing/commonTests";
import { AttachmentStatus, InitiativeAnswerProp } from "types";
import { useStore } from "utils";
import {
  mockAdminUserStore,
  mockHelpDeskUserStore,
  mockUseStore,
} from "utils/testing/setupTest";
import { useFlags } from "launchdarkly-react-client-sdk";

vi.mock("utils/state/useStore");
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

vi.mock("launchdarkly-react-client-sdk");
const mockFlags = vi.mocked(useFlags);
mockFlags.mockReturnValue({
  adminCommentsEnabled: true,
});

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
    comments: [],
  },
];

const CommentModalComponent = (
  allFiles: InitiativeAnswerProp[] = mockAllFiles,
  disabled: boolean = false
) => {
  return (
    <CommentModal
      modalDisclosure={{
        isOpen: true,
        onClose: mockCloseHandler,
      }}
      selectedFile={mockSelectedFile}
      updateElement={mockUpdateElement}
      allFiles={allFiles}
      disabled={disabled}
    />
  );
};

describe("CommentModal component", () => {
  describe("with no comments", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      render(CommentModalComponent());
    });

    test("shows the contents", () => {
      expect(
        screen.getByRole("heading", { name: "Add Comment to test.png" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Comment" })
      ).toBeInTheDocument();
    });

    test("Modals action button can be clicked", async () => {
      await userEvent.click(screen.getByText("Save"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
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
      expect(mockUpdateElement).toHaveBeenCalledWith(
        expect.objectContaining({
          answer: expect.arrayContaining([
            expect.objectContaining({
              comments: [
                expect.objectContaining({
                  name: mockUseStore.user?.full_name,
                  comment: "Test comment",
                }),
              ],
            }),
          ]),
        })
      );
    });
  });

  describe("with previous comments", () => {
    const mockPreviousCommentsInFile = [
      {
        attachment: mockSelectedFile,
        initiatives: ["test 1", "test 2"],
        status: AttachmentStatus.PENDING_REVIEW,
        comments: [
          {
            name: "CMS User",
            date: "Thu Jan 1 2026 00:00:00 GMT-0400 (Eastern Daylight Time)",
            comment: "First comment from cms user",
          },
          {
            name: "CMS User",
            date: "Thu Feb 5 2026 00:00:00 GMT-0400 (Eastern Daylight Time)",
            comment: "Second comment from cms user",
          },
        ],
      },
    ];
    beforeEach(() => {
      vi.clearAllMocks();
      render(CommentModalComponent(mockPreviousCommentsInFile));
    });

    test("Shows previous comments", async () => {
      const previousComments = screen.getAllByRole("textbox", {
        name: "CMS User",
      });
      expect(previousComments).toHaveLength(2);
      // most recent comment should be first in the list
      expect(previousComments[0]).toHaveValue("Second comment from cms user");
      expect(previousComments[1]).toHaveValue("First comment from cms user");
    });
  });

  describe("test permissions", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test("state user can edit always", () => {
      mockedUseStore.mockReturnValue(mockUseStore);
      render(CommentModalComponent());
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeEnabled();
    });

    test("admin user can edit when flag true", () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      render(CommentModalComponent());
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeEnabled();
    });

    test("admin user cannot edit when flag false", () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: false,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      render(CommentModalComponent());
      const commentInput = screen.getByRole("textbox", { name: /Comment/i });
      expect(commentInput).toBeDisabled();
    });

    test("other users can never edit", () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockHelpDeskUserStore);
      render(CommentModalComponent());
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeDisabled();
    });

    test("cannot add comments when disabled", () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockUseStore); // state user
      render(CommentModalComponent(mockAllFiles, true)); // set disabled true
      const commentInput = screen.getByRole("textbox", { name: "Comment" });
      expect(commentInput).toBeDisabled();
    });

    test("admin user can edit attachment status", async () => {
      mockFlags.mockReturnValue({
        adminCommentsEnabled: true,
      });
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      render(CommentModalComponent());
      const statusButton = screen.getAllByLabelText("Status")[1];
      await userEvent.click(statusButton);
      await userEvent.click(
        screen.getByRole("option", { name: "Needs Revision" })
      );
      await userEvent.click(screen.getByText("Save"));
      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
      expect(mockUpdateElement).toHaveBeenCalledWith(
        expect.objectContaining({
          answer: expect.arrayContaining([
            expect.objectContaining({
              comments: [
                expect.objectContaining({
                  name: mockAdminUserStore.user?.full_name,
                  comment: "",
                  statusChange: AttachmentStatus.NEEDS_REVISION,
                }),
              ],
              status: AttachmentStatus.NEEDS_REVISION,
            }),
          ]),
        })
      );
    });
  });

  testA11y(CommentModalComponent());
});
