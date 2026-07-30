import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsPage } from "./NotificationsPage";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getNotificationRecipients,
} from "utils/api/requestMethods/notificationRecipients";
import { NotificationRecipientRecord } from "@rhtp/shared";

const mockRecipient: NotificationRecipientRecord = {
  id: "123",
  state: "PA",
  email: "email@address.com",
  created: Date.now(),
  addedBy: "Approver User",
};

vi.mock("utils/api/requestMethods/notificationRecipients");
const mockCreateRecipient = vi.mocked(createNotificationRecipient);
const mockGetRecipients = vi.mocked(getNotificationRecipients);
const mockDeleteRecipient = vi.mocked(deleteNotificationRecipient);

describe("NotificationsPage component", () => {
  describe("without recipient", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetRecipients.mockResolvedValue([] as NotificationRecipientRecord[]);
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
      expect(
        screen.getByRole("textbox", { name: "Email" })
      ).toBeInTheDocument();
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
      expect(
        screen.getByRole("textbox", { name: "Email" })
      ).toBeInTheDocument();
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
      const alCheckbox = screen.getByLabelText("Alabama");
      await userEvent.click(alCheckbox);

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.queryByText("Add Email")).not.toBeInTheDocument();
      });
      expect(mockCreateRecipient).toHaveBeenCalled();
      expect(mockGetRecipients).toHaveBeenCalled();
    });
  });

  describe("with recipients", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      mockGetRecipients.mockResolvedValue([
        mockRecipient,
      ] as NotificationRecipientRecord[]);
      await act(async () => await render(<NotificationsPage />));
    });

    test("renders recipients in table", () => {
      expect(
        screen.getByRole("heading", { name: "Notifications Settings" })
      ).toBeVisible();
      expect(screen.getByRole("table")).toBeVisible();
      expect(screen.getByText(mockRecipient.email)).toBeVisible();
      expect(screen.getByText(mockRecipient.state)).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: `Edit recipient ${mockRecipient.email}`,
        })
      ).toBeVisible();
      expect(
        screen.getByRole("button", {
          name: `Delete recipient ${mockRecipient.email}`,
        })
      ).toBeVisible();
    });

    test("edit modal can't save with no states selected", async () => {
      const editButton = screen.getByRole("button", {
        name: `Edit recipient ${mockRecipient.email}`,
      });
      expect(editButton).toBeVisible();
      await userEvent.click(editButton);
      expect(
        screen.getByRole("dialog", { name: "Edit assigned states" })
      ).toBeVisible();

      const dropdownBtn = screen.getByLabelText("States select");
      await userEvent.click(dropdownBtn);
      const paCheckbox = screen.getByLabelText("Pennsylvania");
      await userEvent.click(paCheckbox);

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      expect(
        screen.getByText("Must select at least one state.")
      ).toBeInTheDocument();
    });

    test("edit modal checking and unchecking states adds or deletes them", async () => {
      expect(screen.queryByText("AL")).not.toBeInTheDocument();
      const editButton = screen.getByRole("button", {
        name: `Edit recipient ${mockRecipient.email}`,
      });
      expect(editButton).toBeVisible();
      await userEvent.click(editButton);
      expect(
        screen.getByRole("dialog", { name: "Edit assigned states" })
      ).toBeVisible();

      const dropdownBtn = screen.getByLabelText("States select");
      await userEvent.click(dropdownBtn);
      const alCheckbox = screen.getByLabelText("Alabama");
      await userEvent.click(alCheckbox);
      const paCheckbox = screen.getByLabelText("Pennsylvania");
      await userEvent.click(paCheckbox);

      const submitButton = screen.getByText("Save");
      await userEvent.click(submitButton);
      expect(mockCreateRecipient).toHaveBeenCalled();
      expect(mockDeleteRecipient).toHaveBeenCalled();
    });

    test("delete modal deletes recipient", async () => {
      const deleteButton = screen.getByRole("button", {
        name: `Delete recipient ${mockRecipient.email}`,
      });
      expect(deleteButton).toBeVisible();
      await userEvent.click(deleteButton);
      expect(
        screen.getByRole("dialog", {
          name: `Are you sure you want to delete ${mockRecipient.email}?`,
        })
      ).toBeVisible();

      const submitButton = screen.getByRole("button", { name: "Delete" });
      await userEvent.click(submitButton);
      expect(mockDeleteRecipient).toHaveBeenCalled();
    });
  });
});
