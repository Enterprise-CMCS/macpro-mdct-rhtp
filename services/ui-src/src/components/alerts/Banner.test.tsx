import { render, screen } from "@testing-library/react";
import { Banner } from "./Banner";

const bannerData = {
  title: "mock-title",
  description: "mock-description",
  link: "https://example.com",
};

describe("Test Banner", () => {
  test("renders", () => {
    render(
      <Banner
        title={bannerData.title}
        description={bannerData.description}
        link={bannerData.link}
      />
    );
    expect(screen.getByText(bannerData.title)).toBeVisible();
    expect(screen.getByText(bannerData.description)).toBeVisible();
    expect(screen.getByText(bannerData.link)).toBeVisible();
  });
});
