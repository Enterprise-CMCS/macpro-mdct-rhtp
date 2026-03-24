import { render, screen } from "@testing-library/react";
import { ActionTableTemplate, ElementType } from "types";
import { ActionTable } from "./ActionTable";
import userEvent from "@testing-library/user-event";

const updateSpy = vi.fn();

const mockActionTableElement: ActionTableTemplate = {
  id: "mock-accordiongroup-id",
  type: ElementType.ActionTable,
  label: "",
  hintText: "",
  modal: {
    title: "Metrics",
    hintText: undefined,
    elements: [
      {
        type: ElementType.Dropdown,
        validation: "required",
        id: "status",
        children: [
          { label: "Active", value: "active" },
          { label: "Abandon", value: "abandon" },
        ],
      },
    ],
  },
  rows: [
    {
      id: "no",
      header: "#",
      type: ElementType.Paragraph,
    },
    {
      id: "mock-text",
      header: "Text",
      type: ElementType.Textbox,
    },
    {
      id: "status",
      header: "Status",
      type: ElementType.Paragraph,
    },
  ],
  answer: [
    [
      { id: "no", value: "1" },
      { id: "mock-text", value: "hello" },
      { id: "status", value: "active" },
    ],
  ],
};

describe("Test ActionTable component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <ActionTable element={mockActionTableElement} updateElement={updateSpy} />
    );
  });
  test("ActionTable renders", () => {
    expect(screen.getByRole("button", { name: "add" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit/Abandon" })).toBeVisible();
    const { rows } = mockActionTableElement;
    rows.forEach((row) => {
      expect(
        screen.getByRole("columnheader", { name: row.header })
      ).toBeVisible();
    });
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "" })).toHaveValue("hello");
  });
  test("Table triggers autosave", async () => {
    const textbox = screen.getByRole("textbox", { name: "" });
    await userEvent.type(textbox, "mock");
    expect(updateSpy).toHaveBeenCalledTimes(4);
  });
  test("Table row opens the edit modal", async () => {
    const editBtn = screen.getByRole("button", { name: "Edit/Abandon" });
    await userEvent.click(editBtn);
    expect(screen.getByText("Edit Metrics")).toBeVisible();
    const saveBtn = screen.getByRole("button", { name: "Save" });
    await userEvent.click(saveBtn);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
  test("Disable row when status value is Abandon", async () => {
    const addBtn = screen.getByRole("button", { name: "add" });
    await userEvent.click(addBtn);
    const dropdown = screen.getAllByLabelText("Status")[0];
    await userEvent.selectOptions(dropdown, "Abandon");
    const saveBtn = screen.getByRole("button", { name: "Save" });
    await userEvent.click(saveBtn);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
});
