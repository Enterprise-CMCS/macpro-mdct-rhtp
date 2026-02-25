import { render, screen } from "@testing-library/react";
import { UploadModal } from "./UploadModal";
import userEvent from "@testing-library/user-event";

const mockCloseHandler = vi.fn();

vi.mock("utils/other/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  retrieveUploadedFiles: vi.fn().mockReturnValue(Promise.resolve([])),
}));

const modalComponent = (
  <UploadModal
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
    id={"mock-id"}
    year={"2026"}
    state={"PA"}
  />
);

describe("Test Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(modalComponent);
  });

  test("Modal shows the contents", () => {
    expect(screen.getByText("Upload Attachments")).toBeInTheDocument();
  });

  test("Modals action button can be clicked", async () => {
    await userEvent.click(screen.getByText("Done"));
    expect(mockCloseHandler).toHaveBeenCalledTimes(1);
  });

  test("Modals close button can be clicked", async () => {
    await userEvent.click(screen.getByText("Close"));
    expect(mockCloseHandler).toHaveBeenCalledTimes(1);
  });
});
