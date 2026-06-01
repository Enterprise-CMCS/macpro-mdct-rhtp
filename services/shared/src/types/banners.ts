import { ReportType } from "./reports";

export const BannerAreas = {
  ...ReportType,
  Home: "home",
} as const;

/** A banner may be shown on the home page, or any report type's dashboard. */
export type BannerArea = (typeof BannerAreas)[keyof typeof BannerAreas];
export const isBannerArea = (x: unknown): x is BannerArea => {
  return Object.values(BannerAreas).includes(x as BannerArea);
};

export interface BannerFormData {
  title: string;
  area: BannerArea;
  description: string;
  link?: string;
  startDate: string;
  endDate: string;
}

export interface BannerShape extends BannerFormData {
  key: string;
  createdAt: string;
  createdBy: string;
}

/** Determines the display names _and order_ on the Banner Editor page. */
export const bannerAreaLabels: Record<BannerArea, string> = {
  [BannerAreas.Home]: "Home page",
  [BannerAreas.RHTP]: "RHTP report dashboard",
};
export const bannerAreaOptions = Object.entries(bannerAreaLabels).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
);
