import type { Locator } from "@playwright/test";

export const getFirstVisible = async (
  candidates: Locator[]
): Promise<Locator | null> => {
  for (const candidate of candidates) {
    if (
      await candidate
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return candidate.first();
    }
  }

  return null;
};
