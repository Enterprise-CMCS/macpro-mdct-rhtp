import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UploadModal } from "./UploadModal";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "@cmsgov/design-system";

const mockCloseHandler = vi.fn();
const mockChangedExpanded = vi.fn();
const mockSaveToReport = vi.fn();
const mockDeleteFromReport = vi.fn();

vi.mock("utils/api/requestMethods/upload", async (importOriginal) => ({
  ...(await importOriginal()),
  uploadFileToS3: vi.fn(),
  recordFileInDatabaseAndGetUploadUrl: vi
    .fn()
    .mockReturnValue({ presignedUploadUrl: "", fileId: "" }),
  getUploadedFiles: vi
    .fn()
    .mockReturnValue([
      { filename: "mock-name", fileSize: 100, fileId: "mock-id" },
    ]),
}));

const mockPng = new File(["0xMockPngData"], "bar.png", { type: "image/png" });

const modalComponent = (
  <UploadModal
    modalDisclosure={{
      isOpen: true,
      onClose: mockCloseHandler,
    }}
    answer={[]}
    selections={
      <>
        <Dropdown
          name={"mock label"}
          label={"mock label"}
          options={[
            { label: "option 1", value: "opt1" },
            { label: "option 2", value: "opt2" },
          ]}
          value={""}
          onChange={mockChangedExpanded}
        ></Dropdown>
      </>
    }
    saveToReport={mockSaveToReport}
    deleteFromReport={mockDeleteFromReport}
    modalHeading={"Upload Attachments"}
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

  test("Modal dropdowns are selectable", async () => {
    const dropdown = screen.getAllByLabelText("mock label")[0];
    await userEvent.selectOptions(dropdown, "option 2");
    expect(mockChangedExpanded).toHaveBeenCalledTimes(1);
  });

  test("Modal will run saveToReport function when a file is uploaded", async () => {
    const dropArea = screen.getByLabelText("file drop area");
    fireEvent.drop(dropArea, {
      dataTransfer: { items: [{ getAsFile: () => [mockPng] }] },
    });
    await waitFor(() => {
      expect(mockSaveToReport).toHaveBeenCalledTimes(1);
    });
  });

  test("Modals close button can be clicked", async () => {
    await userEvent.click(screen.getByText("Close"));
    expect(mockCloseHandler).toHaveBeenCalledTimes(1);
  });
});
