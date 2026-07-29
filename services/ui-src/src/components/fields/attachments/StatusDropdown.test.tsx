import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusDropdown } from "./StatusDropdown";
import { AttachmentStatus } from "@rhtp/shared";
import userEvent from "@testing-library/user-event";
import { useStore } from "utils";
import { mockUseStore } from "utils/testing/setupTest";

const mockOnChange = vi.fn();

vi.mock("utils/state/useStore");
window.HTMLElement.prototype.scrollIntoView = vi.fn();
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

describe("<StatusDropdown />", () => {
  beforeEach(() => {
    render(
      <StatusDropdown
        status={AttachmentStatus.PENDING_REVIEW}
        onChange={mockOnChange}
      />
    );
  });
  test("StatusDropdown renders", () => {
    expect(screen.getByRole("heading", { name: "Status" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pending Review Status(optional)" })
    ).toBeInTheDocument();
  });
  test("Test status on change", async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "Pending Review Status(optional)" })
    );
    expect(
      screen.queryByRole("option", { name: "Needs Revision" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Locked for Scoring" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Pending Review" })
    ).toBeVisible();
    expect(screen.getByRole("option", { name: "Informational" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Archived" })).toBeVisible();

    await userEvent.click(
      screen.getByRole("option", { name: "Informational" })
    );
    expect(mockOnChange).toHaveBeenCalled();
  });
});
