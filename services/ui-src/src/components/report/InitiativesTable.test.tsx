import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { InitiativesTable } from "./InitiativesTable";
import { ElementType, InitiativesTableTemplate } from "types";
import { useStore } from "utils";
import userEvent from "@testing-library/user-event";
import {
  mockAdminUserStore,
  mockStateUserStore,
} from "utils/testing/setupTest";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;

const mockTemplate: InitiativesTableTemplate = {
  type: ElementType.InitiativesTable,
  id: "mock-table-id",
};

describe("InitiativesTable component", () => {
  describe("admin view", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseStore.mockReturnValue({
        report: {
          pages: [
            {
              sidebar: false,
              id: "mock-initiative-1",
              title: "Mock Initiative",
              initiativeNumber: "123",
            },
          ],
        },
        ...mockAdminUserStore,
      });
      render(<InitiativesTable element={mockTemplate} />);
    });
    test("renders with initiatives", () => {
      expect(
        screen.getByRole("columnheader", { name: "Initiative name Status" })
      ).toBeVisible();
      expect(
        screen.getByRole("columnheader", { name: "Actions" })
      ).toBeVisible();
      expect(
        screen.getByRole("cell", {
          name: "123: Mock Initiative Status: Not started",
        })
      ).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: "Edit status of 123: Mock Initiative",
        })
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Edit 123: Mock Initiative" })
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Add initiative" })
      ).toBeVisible();
    });

    test("can click to edit initiative", async () => {
      const editInitiativeStatusButton = screen.getByRole("button", {
        name: "Edit status of 123: Mock Initiative",
      });
      expect(editInitiativeStatusButton).toBeVisible();
      await userEvent.click(editInitiativeStatusButton);
      expect(
        screen.getByRole("radiogroup", { name: "Abandon initiative?" })
      ).toBeVisible();
      const closeButton = screen.getByRole("button", { name: "Cancel" });
      await userEvent.click(closeButton);
    });
  });
  describe("state user view", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockedUseStore.mockReturnValue({
        report: {
          pages: [
            {
              sidebar: false,
              id: "mock-initiative-1",
              title: "Mock Initiative",
              initiativeNumber: "123",
            },
          ],
        },
        ...mockStateUserStore,
      });
      render(<InitiativesTable element={mockTemplate} />);
    });

    test("renders with initiatives, cannot add or edit initiatives", () => {
      expect(
        screen.getByRole("columnheader", { name: "Initiative name Status" })
      ).toBeVisible();
      expect(
        screen.getByRole("columnheader", { name: "Actions" })
      ).toBeVisible();
      expect(
        screen.getByRole("cell", {
          name: "123: Mock Initiative Status: Not started",
        })
      ).toBeVisible();
      expect(
        screen.queryByRole("button", {
          name: "Edit status of 123: Mock Initiative",
        })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Edit 123: Mock Initiative" })
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Add initiative" })
      ).not.toBeInTheDocument();
    });
  });
});
