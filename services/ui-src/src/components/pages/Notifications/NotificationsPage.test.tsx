import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsPage } from "./NotificationsPage";
import {
  createNotificationRecipient,
  getNotificationRecipients,
} from "utils/api/requestMethods/notificationRecipients";
import { NotificationRecipientRecord } from "@rhtp/shared";

vi.mock("utils/api/requestMethods/notificationRecipients");
const mockCreateRecipient = vi.mocked(createNotificationRecipient);
const mockGetRecipients = vi
  .mocked(getNotificationRecipients)
  .mockResolvedValue([] as NotificationRecipientRecord[]);

describe("NotificationsPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => await render(<NotificationsPage />));
  });

  test("renders", () => {
    expect(
      screen.getByRole("heading", { name: "Notifications Settings" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Add email" })).toBeVisible();
    expect(mockGetRecipients).toHaveBeenCalled();
  });

  test("add email modal opens and has inputs", async () => {
    const addEmailButton = screen.getByRole("button", { name: "Add email" });
    await userEvent.click(addEmailButton);
    expect(
      screen.getByRole("heading", { name: "Add Email" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    const closeButton = screen.getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);
    expect(
      screen.queryByRole("heading", { name: "Add Email" })
    ).not.toBeInTheDocument();
  });

  test("email modal shows errors when input invalid", async () => {
    const addEmailButton = screen.getByRole("button", { name: "Add email" });
    await userEvent.click(addEmailButton);
    expect(
      screen.getByRole("heading", { name: "Add Email" })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: "Save" });
    await userEvent.click(submitButton);
    expect(screen.getByText("Must enter a valid email.")).toBeInTheDocument();
    expect(
      screen.getByText("Must select at least one state.")
    ).toBeInTheDocument();
  });

  test("modal closes on submit with valid inputs", async () => {
    const addEmailButton = screen.getByText("Add email");
    await userEvent.click(addEmailButton);
    expect(screen.getByText("Add Email")).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    await userEvent.click(emailInput);
    await userEvent.paste("valid@email.com");

    const dropdownBtn = screen.getByLabelText("States select");
    await userEvent.click(dropdownBtn);
    const optCheckbox1 = screen.getByLabelText("Alabama");
    await userEvent.click(optCheckbox1);

    const submitButton = screen.getByText("Save");
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByText("Add Email")).not.toBeInTheDocument();
    });
    expect(mockCreateRecipient).toHaveBeenCalled();
    expect(mockGetRecipients).toHaveBeenCalled();
  });
});
