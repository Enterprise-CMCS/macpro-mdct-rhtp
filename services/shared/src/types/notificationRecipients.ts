export type NotificationRecipientRecord = {
  id: string;
  email: string;
  state: string;
  addedBy: string;
  created: number;
};

export type CreateNotificationRecipientBody = {
  email: string;
};
