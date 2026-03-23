import { MockedFunction } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AddEditInitiativeModal } from "./AddEditInitiativeModal";
import userEvent from "@testing-library/user-event";
import { useStore } from "utils";
import {
  createInitiative,
  updateInitiative,
} from "utils/api/requestMethods/initiatives";
import { mockReportStore } from "utils/testing/setupTest";
import { InitiativePageTemplate } from "types";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockReportStore);

vi.mock("utils/api/requestMethods/initiatives");
const mockCreateInitiative = vi.mocked(createInitiative);
const mockUpdateInitiative = vi.mocked(updateInitiative);

vi.mock("utils/auth/authLifecycle");
vi.mock("utils/api/requestMethods/reports");

describe("AddEditInitiativeModal component", () => {
  describe("Adding initiative", () => {
    beforeEach(() => {
      render(
        <AddEditInitiativeModal
          modalDisclosure={{
            isOpen: true,
            onClose: vi.fn(),
          }}
          selectedInitiative={undefined}
        />
      );
    });

    test("renders add form for new initiative", async () => {
      expect(
        screen.getByRole("heading", { name: "Add Initiative" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Initiative Number" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: "Initiative Name" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      const closeButton = screen.getByRole("button", { name: "Cancel" });
      expect(closeButton).toBeInTheDocument();
      await userEvent.click(closeButton);
    });

    test("shows errors when form empty for new initiative", async () => {
      expect(
        screen.queryByText("A response is required")
      ).not.toBeInTheDocument();
      const saveButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveButton);
      await waitFor(async () => {
        await expect(
          screen.getAllByText("A response is required")[0]
        ).toBeVisible();
      });
    });

    test("can successfully fill out and submit add initiative form", async () => {
      const initiativeNumberInput = screen.getByRole("textbox", {
        name: "Initiative Number",
      });
      const initiativeNameInput = screen.getByRole("textbox", {
        name: "Initiative Name",
      });

      await userEvent.type(initiativeNumberInput, "123");
      await userEvent.type(initiativeNameInput, "New Initiative");

      const saveButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveButton);

      expect(mockCreateInitiative).toHaveBeenCalledWith(
        mockReportStore.report,
        {
          initiativeName: "New Initiative",
          initiativeNumber: "123",
        }
      );
    });
  });

  describe("Editing an initiative", () => {
    beforeEach(() => {
      render(
        <AddEditInitiativeModal
          modalDisclosure={{
            isOpen: true,
            onClose: vi.fn(),
          }}
          selectedInitiative={
            {
              id: "mock-initiative-1",
              title: "Mock initiative",
              initiativeNumber: "123",
            } as InitiativePageTemplate
          }
        />
      );
    });

    test("renders edit form for edit initiative", () => {
      expect(
        screen.getByRole("heading", { name: "Edit 123: Mock initiative" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radiogroup", { name: "Abandon initiative?" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    test("shows errors when abandon unchecked for edit initiative", async () => {
      expect(
        screen.queryByText("A response is required")
      ).not.toBeInTheDocument();
      const saveButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveButton);
      await waitFor(async () => {
        await expect(
          screen.getAllByText("A response is required")[0]
        ).toBeVisible();
      });
    });

    test("can successfully fill out and submit edit initiative form", async () => {
      const initiativeAbandonInput = screen.getByRole("radio", { name: "Yes" });

      await userEvent.click(initiativeAbandonInput);

      const saveButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveButton);

      expect(mockUpdateInitiative).toHaveBeenCalledWith(
        mockReportStore.report,
        {
          initiativeAbandon: true,
        },
        "mock-initiative-1"
      );
    });
  });
});
