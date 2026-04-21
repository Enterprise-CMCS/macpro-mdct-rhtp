// BANNER

import { BannerData } from "@rhtp/shared";

export interface AdminBannerMethods {
  fetchAdminBanner: () => Promise<void>;
  writeAdminBanner: (data: BannerData) => Promise<void>;
  deleteAdminBanner: () => Promise<void>;
}

export interface AdminBannerShape extends AdminBannerMethods {}
