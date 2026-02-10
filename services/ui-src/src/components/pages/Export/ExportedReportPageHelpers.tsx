import { PageTemplate } from "types";

export const shouldRender = (section: PageTemplate) => {
  if (section.id === "review-submit" || section.id === "root") {
    return false;
  }
  return true;
};
