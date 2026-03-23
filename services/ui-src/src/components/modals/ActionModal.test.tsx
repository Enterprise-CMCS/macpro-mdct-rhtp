import { render, screen } from "@testing-library/react";
import { ActionModal } from "./ActionModal";
import { ElementType } from "types";
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
      validation: "required",
    },
    {
      id: "mock-textbox",
      type: ElementType.Textbox,
      validation: "required",
    },
    { id: "mock-date", type: ElementType.Date, validation: "date" },
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
  test("Modal fields update with user input", () => {
    const textbox = screen.getByRole("textbox", { name: "Mock Textbox" });
    userEvent.type(textbox, "hello");
    screen.debug(textbox);
  });
});
