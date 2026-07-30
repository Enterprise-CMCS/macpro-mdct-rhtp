import { PageTemplate } from "types";

export const shouldRender = (section: PageTemplate) => {
  if (
    section.id === "review-submit" ||
    section.id === "root" ||
    section.id === "initiative-attachments"
  ) {
    return false;
  }
  return true;
};
