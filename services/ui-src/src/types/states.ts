import { ReactNode } from "react";
import {
  ParentPageTemplate,
  Report,
  BannerShape,
  BannerFormData,
} from "@rhtp/shared";
import { PageData, User } from "types";

export interface BannerState {
  /** All banners, active and inactive, for every area of the site */
  allBanners: BannerShape[];
  /** When was the last time banners were fetched? */
  _lastFetchTime: number;
  fetchBanners: () => Promise<void>;
  createBanner: (data: BannerFormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

// initial user state
export interface UserState {
  // INITIAL STATE
  user?: User;
  showLocalLogins: boolean | undefined;
  // ACTIONS
  setUser: (newUser?: User) => void;
  setShowLocalLogins: (showLocalLogins: boolean) => void;
}

export interface ReportState {
  // INITIAL STATE
  report?: Report;
  pageMap?: Map<string, number>;
  rootPage?: ParentPageTemplate;
  parentPage?: PageData; // used for looking up curr & next page
  currentPageId?: string;
  modalOpen: boolean;
  modalHeader?: string;
  modalComponent?: ReactNode;
  lastSavedTime?: string;
  errorMessage?: string;
  sidebarOpen: boolean;

  // ACTIONS
  loadReport: (report?: Report) => void;
  updateReport: (report?: Report) => void;
  setCurrentPageId: (currentPageId: string) => void;
  setModalOpen: (modalOpen: boolean) => void;
  setModalComponent: (modalComponent: ReactNode, modalHeader: string) => void;
  setAnswers: (answers: any, pageId?: string) => void;
  completePage: (pageId: string) => void;
  setSidebar: (sidebarOpen: boolean) => void;
  saveReport: () => void;
}

export interface DevToolsState {
  devDate: string | undefined;
  setDevDate: (date: string) => void;
}
