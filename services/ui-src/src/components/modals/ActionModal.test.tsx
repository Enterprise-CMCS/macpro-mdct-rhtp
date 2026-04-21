import { render, screen } from "@testing-library/react";
import { ActionModal } from "./ActionModal";
import { ElementType } from "@rhtp/shared";
import userEvent from "@testing-library/user-event";

const mockCloseHandler = vi.fn();
const mockSaveHandler = vi.fn();

const rows = [
  { id: "no", header: "#", type: ElementType.Paragraph },
  { id: "status", header: "Status", type: ElementType.Paragraph },
  { id: "mock-textbox", header: "Mock Textbox", type: ElementType.Textbox },
  { id: "mock-date", header: "Mock Date", type: ElementType.Date },
];

const modal = {
  title: "Mock Modal",
  hintText: "[hint text]",
  elements: [
    {
      id: "status",
      type: ElementType.Dropdown,
      editOnly: true,
      children: [
        { label: "Active", value: "Active" },
        { label: "Abandon", value: "Abandon" },
      ],
      required: true,
    },
    {
      id: "mock-textbox",
      type: ElementType.Textbox,
      required: true,
    },
    { id: "mock-date", type: ElementType.Date, required: true },
  ],
};

describe("Test ActionModal component", () => {
  beforeEach(() => {
    const initial = rows.map((row) => ({ id: row.id, value: "" }));
    render(
      <ActionModal
        modal={modal}
        rows={rows}
        form={{
          data: initial,
          index: undefined,
        }}
        onSave={mockSaveHandler}
        modalDisclosure={{
          isOpen: true,
          onClose: mockCloseHandler,
        }}
      />
    );
  });
  test("Modal renders", () => {
    expect(screen.getByText("Add Mock Modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Mock Textbox" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Close" })[0]
    ).toBeInTheDocument();
  });
  test("Modal fields update with user input", async () => {
    const textbox = screen.getByRole("textbox", { name: "Mock Textbox" });
    await userEvent.type(textbox, "hello");
    expect(textbox).toHaveValue("hello");
  });
  test("Modal save", async () => {
    const textbox = screen.getByRole("textbox", { name: "Mock Textbox" });
    await userEvent.type(textbox, "hello");

    const date = screen.getByRole("textbox", { name: "Mock Date" });
    await userEvent.type(date, "2/2/2022");

    const saveBtn = screen.getByRole("button", { name: "Save" });
    await userEvent.click(saveBtn);
    expect(mockSaveHandler).toHaveBeenCalled();
  });
  test("Modal closes", async () => {
    const closeBtn = screen.getAllByRole("button", { name: "Close" })[0];
    await userEvent.click(closeBtn);
    expect(mockCloseHandler).toHaveBeenCalled();
  });
});
