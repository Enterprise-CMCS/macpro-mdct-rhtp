import { ActionTableTemplate, ElementType } from "types";
import { ActionTable } from "./ActionTable";

const updateSpy = vi.fn();

const mockActionTableElement: ActionTableTemplate = {
  id: "mock-accordiongroup-id",
  type: ElementType.ActionTable,
  answer: [],
  label: "",
  hintText: "",
  modal: {
    title: "",
    hintText: undefined,
    elements: [],
  },
  rows: [],
};

describe("Test ActionTable component", () => {
  test("ActionTable renders", () => {
    <ActionTable element={mockActionTableElement} updateElement={updateSpy} />;
  });
});
