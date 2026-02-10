import { render, screen } from "@testing-library/react";
import { Banner } from "./Banner";

const bannerData = {
  title: "mock-title",
  description: "mock-description",
};

describe("Test Banner", () => {
  test("Test Banner with no data", () => {
    const { container } = render(<Banner bannerData={undefined}></Banner>);
    expect(container.childElementCount).toEqual(0);
  });
  test("Test Banner with data", () => {
    render(<Banner bannerData={bannerData}></Banner>);
    expect(screen.getByText(bannerData.title)).toBeInTheDocument();
    expect(screen.getByText(bannerData.description)).toBeInTheDocument();
  });
});
