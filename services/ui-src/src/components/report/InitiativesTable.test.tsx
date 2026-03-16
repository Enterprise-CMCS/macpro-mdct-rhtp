import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { InitiativesTable } from "./InitiativesTable";
import { ElementType, InitiativesTableTemplate } from "types";
import { useStore } from "utils";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue({
  report: {
    pages: [
      {
        id: "root",
      },
    ],
  },
});

const mockTemplate: InitiativesTableTemplate = {
  type: ElementType.InitiativesTable,
  id: "mock-table-id",
};

describe("InitiativesTable component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("renders", () => {
    render(<InitiativesTable element={mockTemplate} />);
    expect(
      screen.getByRole("columnheader", { name: "Initiative name Status" })
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });

  test("renders with initiatives", () => {
    mockedUseStore.mockReturnValueOnce({
      report: {
        pages: [
          {
            sidebar: false,
            id: "mock-initiative-1",
            title: "Mock Initiative 1",
          },
        ],
      },
    });
    render(<InitiativesTable element={mockTemplate} />);
    expect(
      screen.getByRole("columnheader", { name: "Initiative name Status" })
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(
      screen.getByRole("cell", {
        name: "Mock Initiative 1 Status: Not started",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Edit name or status of Mock Initiative 1",
      })
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Edit Mock Initiative 1" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add initiative" })
    ).toBeVisible();
  });
});
