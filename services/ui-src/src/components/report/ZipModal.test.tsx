import { render, screen } from "@testing-library/react";
import { Modal } from "@chakra-ui/react";
import userEvent from "@testing-library/user-event";
import { ZipModal } from "./ZipModal";

const mockClose = vi.fn();
const mockSubmit = vi.fn();

describe("Test ZipModal", () => {
  test("Test ZipModal for RHTP Render", async () => {
    const modal = ZipModal(mockClose, mockSubmit);
    render(
      <Modal isOpen={true} onClose={mockClose}>
        {modal}
      </Modal>
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelBtn);
    expect(mockClose).toHaveBeenCalled();

    const submit = screen.getByRole("button", { name: "ZIP Files" });
    await userEvent.click(submit);
    expect(mockSubmit).toHaveBeenCalled();
  });

  test("Test ZipModal cancel and submit interactions", async () => {
    const modal = ZipModal(mockClose, mockSubmit);
    render(
      <Modal isOpen={true} onClose={mockClose}>
        {modal}
      </Modal>
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await userEvent.click(cancelBtn);
    expect(mockClose).toHaveBeenCalled();

    const submit = screen.getByRole("button", { name: "ZIP Files" });
    await userEvent.click(submit);
    expect(mockSubmit).toHaveBeenCalled();
  });
});
