import { ParentPageTemplate, PageData, Report } from "types/report";
import { ReactNode } from "react";
import { BannerData, ErrorVerbiage, User } from "types";

export interface AdminBannerState {
  bannerData: BannerData | undefined;
  bannerActive: boolean;
  bannerLoading: boolean;
  bannerErrorMessage: ErrorVerbiage | undefined;
  bannerDeleting: boolean;
  // ACTIONS
  setBannerData: (newBannerData: BannerData | undefined) => void;
  clearAdminBanner: () => void;
  setBannerActive: (bannerStatus: boolean) => void;
  setBannerLoading: (bannerLoading: boolean) => void;
  setBannerErrorMessage: (
    bannerErrorMessage: ErrorVerbiage | undefined
  ) => void;
  setBannerDeleting: (bannerDeleting: boolean) => void;
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
  setAnswers: (answers: any) => void;
  completePage: (measureId: string) => void;
  setSidebar: (sidebarOpen: boolean) => void;
  saveReport: () => void;
}
