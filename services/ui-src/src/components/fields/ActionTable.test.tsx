import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActionTableTemplate, ElementType } from "types";
import { ActionTable } from "./ActionTable";
import userEvent from "@testing-library/user-event";
import { useStore } from "utils";
import {
  mockAdminUserStore,
  mockStateUserStore,
} from "utils/testing/setupTest";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

const updateSpy = vi.fn();

const mockActionTableElement: ActionTableTemplate = {
  id: "mock-action-table-id",
  type: ElementType.ActionTable,
  label: "",
  hintText: "",
  modal: {
    title: "Metrics",
    hintText: undefined,
    elements: [
      {
        type: ElementType.Dropdown,
        required: true,
        id: "status",
        children: [
          { label: "Active", value: "active" },
          { label: "Abandoned", value: "Abandoned" },
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
      { id: "mock-text", value: "hello" },
      { id: "status", value: "active" },
    ],
    [
      { id: "mock-text", value: "bye" },
      { id: "status", value: "Abandoned" },
    ],
  ],
};

describe("Test ActionTable component", () => {
  describe("test admin user functionality", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseStore.mockReturnValue(mockAdminUserStore);
      render(
        <ActionTable
          element={mockActionTableElement}
          updateElement={updateSpy}
        />
      );
    });
    test("Table row opens the add modal", async () => {
      const addBtn = screen.getByRole("button", { name: "add" });
      await userEvent.click(addBtn);
      expect(screen.getByText("Add Metrics")).toBeVisible();
      const saveBtn = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveBtn);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
    test("Table row opens the edit modal", async () => {
      const editBtn = screen.getAllByRole("button", {
        name: "Edit/Abandon",
      })[0];
      await userEvent.click(editBtn);
      expect(screen.getByText("Edit Metrics")).toBeVisible();
    });
    test("Row inputs are disabled when status value is Abandoned, but admin can still change status", async () => {
      expect(
        screen.getByRole("row", { name: "2 bye Abandoned Edit/Abandon" })
      ).toBeVisible();
      const textbox = screen.getAllByRole("textbox", { name: "" })[1];
      expect(textbox).toHaveValue("bye");
      expect(textbox).toBeDisabled();
      const editBtn = screen.getAllByRole("button", { name: "Edit/Abandon" });
      expect(editBtn[1]).toBeEnabled();
    });
  });

  describe("test state user functionality", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseStore.mockReturnValue(mockStateUserStore);
      render(
        <ActionTable
          element={mockActionTableElement}
          updateElement={updateSpy}
        />
      );
    });
    test("ActionTable renders", () => {
      expect(screen.getByRole("button", { name: "add" })).toBeVisible();
      expect(
        screen.getAllByRole("button", { name: "Edit/Abandon" }).length
      ).toBe(2);
      const { rows } = mockActionTableElement;
      rows.forEach((row) => {
        expect(
          screen.getByRole("columnheader", { name: row.header })
        ).toBeVisible();
      });
      expect(
        screen.getByRole("columnheader", { name: "Actions" })
      ).toBeVisible();
      expect(screen.getAllByRole("textbox", { name: "" })[0]).toHaveValue(
        "hello"
      );
    });
    test("Table triggers autosave", async () => {
      const textbox = screen.getAllByRole("textbox", { name: "" })[0];
      await userEvent.type(textbox, "mock");
      expect(updateSpy).toHaveBeenCalledTimes(4);
    });
    test("Cannot open the add modal", async () => {
      const addBtn = screen.getByRole("button", { name: "add" });
      expect(addBtn).toBeDisabled();
    });
    test("Table row opens the edit modal", async () => {
      const editBtn = screen.getAllByRole("button", {
        name: "Edit/Abandon",
      })[0];
      expect(editBtn).toBeDisabled();
    });
    test("Row inputs are disabled when status value is Abandoned", async () => {
      expect(
        screen.getByRole("row", { name: "2 bye Abandoned Edit/Abandon" })
      ).toBeVisible();
      const textbox = screen.getAllByRole("textbox", { name: "" })[1];
      expect(textbox).toHaveValue("bye");
      expect(textbox).toBeDisabled();
      const editBtn = screen.getAllByRole("button", { name: "Edit/Abandon" });
      expect(editBtn[1]).toBeDisabled();
    });
  });
});
