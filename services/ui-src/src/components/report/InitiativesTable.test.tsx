import { render, screen } from "@testing-library/react";
import { InitiativesTable } from "./InitiativesTable";
import { ElementType, InitiativesTableTemplate } from "types";

const mockTemplate: InitiativesTableTemplate = {
  type: ElementType.InitiativesTable,
  id: "mock-table-id",
};

describe("InitiativesTable component", () => {
  test("renders", () => {
    render(<InitiativesTable element={mockTemplate} />);
    expect(screen.getByText("Coming soon...")).toBeVisible();
  });
});
