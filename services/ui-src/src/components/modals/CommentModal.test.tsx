import { render, screen } from "@testing-library/react";
import { CommentModal } from "./CommentModal";
import userEvent from "@testing-library/user-event";
import { testA11y } from "utils/testing/commonTests";

const mockCloseHandler = vi.fn();

const CommentModalComponent = (
  <CommentModal
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
  />
);

describe("CommentModal component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(CommentModalComponent);
  });

  test("shows the contents", () => {
    expect(
      screen.getByRole("heading", { name: /Add Comment/ })
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

  testA11y(CommentModalComponent);
});
