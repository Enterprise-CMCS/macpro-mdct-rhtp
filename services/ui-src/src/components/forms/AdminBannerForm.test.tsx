import { render, screen } from "@testing-library/react";
import { AdminBannerForm } from "components";
import userEvent from "@testing-library/user-event";
import { testA11yAct } from "utils/testing/commonTests";
import { BannerShape } from "@rhtp/shared";
import { useStore } from "utils";

const mockCreateBanner = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const AdminBannerFormComponent = (
  <AdminBannerForm createBanner={mockCreateBanner} />
);

describe("<AdminBannerForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(AdminBannerFormComponent);
  });

  test("AdminBannerForm can be filled and submitted without error", async () => {
    const siteAreaDropdown = screen.getAllByLabelText("Site area")[0];
    await userEvent.selectOptions(siteAreaDropdown, "RHTP");

    const titleInput = screen.getByLabelText("Title text");
    await userEvent.click(titleInput);
    await userEvent.paste("mock title");

    const descriptionInput = screen.getByLabelText("Description text");
    await userEvent.click(descriptionInput);
    await userEvent.paste("mock description");

    const linkInput = screen.getByLabelText("Link", { exact: false });
    await userEvent.click(linkInput);
    await userEvent.paste("http://example.com");

    const startDateInput = screen.getByLabelText("Start date");
    await userEvent.click(startDateInput);
    await userEvent.paste("01/01/1970");

    const endDateInput = screen.getByLabelText("End date");
    await userEvent.click(endDateInput);
    await userEvent.paste("01/02/1970");

    const submitButton = screen.getByText("Create Banner");
    await userEvent.click(submitButton);

    expect(mockCreateBanner).toHaveBeenCalledWith({
      area: "RHTP",
      title: "mock title",
      description: "mock description",
      link: "http://example.com",
      startDate: "1970-01-01",
      endDate: "1970-01-02",
    });
  });

  testA11yAct(AdminBannerFormComponent);
});

describe("AdminBannerForm validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(AdminBannerFormComponent);
  });

  test("Display form errors when user tries to submit completely blank form", async () => {
    const submitButton = screen.getByText("Create Banner");
    await userEvent.click(submitButton);

    const responseIsRequiredErrorMessage = screen.getAllByText(
      "A response is required",
      { exact: false }
    );
    expect(responseIsRequiredErrorMessage[0]).toBeVisible();
    expect(responseIsRequiredErrorMessage.length).toBe(4);
  });

  test("Display errors when date range conflicts with existing banners", async () => {
    const existingBanner = {
      title: "alpha",
      area: "home",
      startDate: "2026-01-10",
      endDate: "2026-01-20",
    } as BannerShape;
    useStore.setState({ allBanners: [existingBanner] });

    const startDateInput = screen.getByLabelText("Start date");
    const endDateInput = screen.getByLabelText("End date");
    const startDateConflict = /Start date conflicts .* alpha/;
    const endDateConflict = /End date conflicts .* alpha/;
    const rangeConflict = /date range conflicts .* alpha/;

    // No data entered yet, therefore no conflicts
    expect(screen.queryByText(startDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(endDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(rangeConflict)).not.toBeInTheDocument();

    // Start date OK, end date in existing banner's range
    await userEvent.type(startDateInput, "01/05/2026");
    await userEvent.type(endDateInput, "01/18/2026");
    expect(screen.queryByText(startDateConflict)).not.toBeInTheDocument();
    expect(screen.getByText(endDateConflict)).toBeVisible();
    expect(screen.queryByText(rangeConflict)).not.toBeInTheDocument();

    // End date OK, end date in existing banner's range
    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, "01/12/2026");
    await userEvent.clear(endDateInput);
    await userEvent.type(endDateInput, "01/25/2026");
    expect(screen.getByText(startDateConflict)).toBeVisible();
    expect(screen.queryByText(endDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(rangeConflict)).not.toBeInTheDocument();

    // Both dates OK individually, but the range overlaps
    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, "01/05/2026");
    expect(screen.queryByText(startDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(endDateConflict)).not.toBeInTheDocument();
    expect(screen.getByText(rangeConflict)).toBeVisible();

    // Move the banner to a different area, so no conflict
    await userEvent.click(screen.getByRole("button", { name: /Site area/ }));
    await userEvent.click(screen.getByRole("option", { name: /RHTP report/ }));
    expect(screen.queryByText(startDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(endDateConflict)).not.toBeInTheDocument();
    expect(screen.queryByText(rangeConflict)).not.toBeInTheDocument();
  });

  test("User has form errors but then fills out the form and errors go away", async () => {
    const submitButton = screen.getByText("Create Banner");
    const titleInput = screen.getByLabelText("Title text");
    const descriptionInput = screen.getByLabelText("Description text");
    const linkInput = screen.getByLabelText("Link", { exact: false });
    const startDateInput = screen.getByLabelText("Start date");
    const endDateInput = screen.getByLabelText("End date");

    // User clicks submit button without filling any fields in
    await userEvent.click(submitButton);
    const responseIsRequiredErrorMessage = screen.getAllByText(
      "A response is required",
      { exact: false }
    );

    expect(responseIsRequiredErrorMessage[0]).toBeVisible();
    expect(responseIsRequiredErrorMessage.length).toBe(4);

    // User then fills in all the fields and is able to submit
    await userEvent.type(titleInput, "mock title");
    await userEvent.type(descriptionInput, "mock description");
    await userEvent.type(linkInput, "http://example.com");
    await userEvent.type(startDateInput, "01/01/1970");
    await userEvent.type(endDateInput, "01/02/1970");
    await userEvent.click(submitButton);

    // Errors go away when user fills out all fields
    expect(
      screen.queryAllByText("A response is required", { exact: false })
    ).toStrictEqual([]);

    // Ensure that the error message for the end date is not displayed
    expect(
      screen.queryByText("End date can't be before start date")
    ).not.toBeInTheDocument();

    expect(mockCreateBanner).toHaveBeenCalledWith({
      area: "home",
      title: "mock title",
      description: "mock description",
      link: "http://example.com",
      startDate: "1970-01-01",
      endDate: "1970-01-02",
    });
  });
});
