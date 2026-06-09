import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmitForReview } from "./SubmitForReview";
import { useStore } from "utils";
import { mockUseStore } from "utils/testing/setupTest";
import userEvent from "@testing-library/user-event";
import { createComment } from "utils/api/requestMethods/commentMethods";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

vi.mock("utils/api/requestMethods/commentMethods");
const mockCreateComment = vi.mocked(createComment);

const openAndCompleteFormWithText = async (text: string) => {
  const modalButton = screen.getByRole("button", { name: "Submit for Review" });
  await userEvent.click(modalButton);
  expect(
    screen.getByRole("heading", { name: "Submit for Review" })
  ).toBeVisible();
  const commentBox = screen.getByRole("textbox", { name: "Add Comment" });
  const submitButton = screen.getByRole("button", {
    name: "Submit for Review",
  });
  expect(commentBox).toBeVisible();
  expect(submitButton).toBeVisible();
  if (text) {
    await userEvent.type(commentBox, text);
  }
  await userEvent.click(submitButton);
};

describe("SubmitForReview component", () => {
  test("does not render when no report in store", () => {
    mockedUseStore.mockReturnValue({});
    const { container } = render(<SubmitForReview />);
    expect(container).toBeEmptyDOMElement();
  });

  describe("test functionality", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseStore.mockReturnValue(mockUseStore);
      render(<SubmitForReview />);
    });
    test("renders", () => {
      expect(screen.getByText("Ready for Review?")).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Submit for Review" })
      ).toBeVisible();
    });

    test("can open and close modal", async () => {
      const modalButton = screen.getByRole("button", {
        name: "Submit for Review",
      });
      await userEvent.click(modalButton);
      expect(
        screen.getByRole("heading", { name: "Submit for Review" })
      ).toBeVisible();
      expect(
        screen.getByRole("textbox", { name: "Add Comment" })
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Submit for Review" })
      ).toBeVisible();
      const closeButton = screen.getByRole("button", { name: "Close" });
      await userEvent.click(closeButton);
      expect(mockCreateComment).not.toHaveBeenCalled();
    });

    test("shows error message for empty comment box", async () => {
      await openAndCompleteFormWithText("");
      expect(screen.getByText("A response is required.")).toBeVisible();
      expect(mockCreateComment).not.toHaveBeenCalled();
    });

    test("open and submit modal", async () => {
      await openAndCompleteFormWithText("Please review");
      expect(mockCreateComment).toHaveBeenCalledWith(
        mockUseStore.report?.id,
        mockUseStore.report?.state,
        {
          comment: "Please review",
          type: "report",
        }
      );
      expect(screen.getByText("Submitted for Review")).toBeVisible();
    });
  });
});
