import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterWrappedComponent, mockUseStore } from "utils/testing/setupTest";
import { useStore } from "utils";
import { SubnavBar } from "./SubnavBar";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

describe("Test SubnavBar component", () => {
  test("SubnavBar is visible", () => {
    render(
      <RouterWrappedComponent>
        <SubnavBar />
      </RouterWrappedComponent>
    );
    expect(screen.getByText("mock-report-title")).toBeVisible();
    expect(screen.getByRole("link", { name: "Leave form" })).toBeVisible();
  });
});
