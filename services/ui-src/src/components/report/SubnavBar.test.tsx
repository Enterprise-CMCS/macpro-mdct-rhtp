import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouterWrappedComponent, mockUseStore } from "utils/testing/setupTest";
import { useStore } from "utils";
import { SubnavBar } from "./SubnavBar";
import { ReportType } from "types";

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

describe("Test SubnavBar component", () => {
  test("SubnavBar is visible", () => {
    render(
      <RouterWrappedComponent>
        <SubnavBar reportType="RHTP" stateName={"PR"} />
      </RouterWrappedComponent>
    );
    expect(screen.getByText("PR RHTP Report")).toBeVisible();
    expect(screen.getByRole("link", { name: "Leave form" })).toBeVisible();
  });

  test.each([{ type: ReportType.RHTP, text: "RHTP Report" }])(
    "$type report type renders a title",
    ({ type, text }) => {
      render(
        <RouterWrappedComponent>
          <SubnavBar reportType={type} stateName={"PR"} />
        </RouterWrappedComponent>
      );
      expect(screen.getByText("PR " + text)).toBeVisible();
    }
  );
});
