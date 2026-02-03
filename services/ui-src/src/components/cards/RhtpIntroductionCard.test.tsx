import { RhtpIntroductionCard } from "./RhtpIntroductionCard";
import { render, screen } from "@testing-library/react";
import { testA11yAct } from "utils/testing/commonTests";
import { RouterWrappedComponent } from "utils/testing/mockRouter";

const component = (
  <RouterWrappedComponent>
    <RhtpIntroductionCard />
  </RouterWrappedComponent>
);

describe("RhtpIntroductionCard", () => {
  it("should render", () => {
    render(component);
    expect(
      screen.getByText("When is the RHTP Report Due?", {
        exact: false,
      })
    ).toBeVisible();
  });

  testA11yAct(component);
});
