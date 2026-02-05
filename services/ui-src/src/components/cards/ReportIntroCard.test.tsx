import { MockedFunction } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportIntroCard } from "components";
import { mockUseStore, RouterWrappedComponent } from "utils/testing/setupTest";
import { useStore } from "utils";
import { testA11y } from "utils/testing/commonTests";

vi.mock("utils/other/useBreakpoint", () => ({
  useBreakpoint: vi.fn(() => ({
    isDesktop: true,
  })),
}));

vi.mock("utils/state/useStore");
const mockedUseStore = useStore as unknown as MockedFunction<typeof useStore>;
mockedUseStore.mockReturnValue(mockUseStore);

const mockUseNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockUseNavigate,
}));

const rhtpReportTypeCardComponent = (
  <RouterWrappedComponent>
    <ReportIntroCard title="RHTP">
      This is the body of the report intro card. Normally it would contain a
      description of the report, as well as an instance of
      <code>&lt;IntroCardActions&gt;</code>
    </ReportIntroCard>
  </RouterWrappedComponent>
);

describe("<ReportTypeCard />", () => {
  describe("Renders", () => {
    beforeEach(() => {
      render(rhtpReportTypeCardComponent);
    });

    test("RHTP ReportTypeCard is visible", () => {
      expect(screen.getByText("RHTP")).toBeVisible();
    });

    test("RHTP ReportTypeCard image is visible on desktop", () => {
      const imageAltText = "Spreadsheet icon";
      expect(screen.getByAltText(imageAltText)).toBeVisible();
    });
  });

  testA11y(rhtpReportTypeCardComponent);
});
