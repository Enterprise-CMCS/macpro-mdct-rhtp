import { render, screen } from "@testing-library/react";
import { AddEditInitiativeModal } from "./AddEditInitiativeModal";

describe("AddEditInitiativeModal component", () => {
  test("renders add form for new initiative", () => {
    render(
      <AddEditInitiativeModal
        modalDisclosure={{
          isOpen: true,
          onClose: vi.fn(),
        }}
        selectedInitiative={undefined}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Add Initiative" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Initiative Number" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Initiative Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Attestation" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("renders add form for new initiative", () => {
    render(
      <AddEditInitiativeModal
        modalDisclosure={{
          isOpen: true,
          onClose: vi.fn(),
        }}
        selectedInitiative={{
          title: "Mock initiative",
        }}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Add Initiative" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Initiative Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Abandon initiative?" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
