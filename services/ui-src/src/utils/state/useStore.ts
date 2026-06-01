import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Report, BannerFormData } from "@rhtp/shared";
import {
  UserState,
  User,
  ReportState,
  DevToolsState,
  BannerState,
} from "types";
import { ReactNode } from "react";
import {
  buildState,
  markPageComplete,
  mergeAnswers,
  saveReport,
  setPage,
} from "./reportLogic/reportActions";
import {
  createBanner,
  deleteBanner,
  getBanners,
} from "utils/api/requestMethods/banner";

// USER STORE
const userStore = (set: Set<UserState>) => ({
  // initial state
  user: undefined,
  // show local logins
  showLocalLogins: undefined,
  // actions
  setUser: (newUser?: User) =>
    set(() => ({ user: newUser }), false, { type: "setUser" }),
  // toggle show local logins (dev only)
  setShowLocalLogins: () =>
    set(() => ({ showLocalLogins: true }), false, { type: "showLocalLogins" }),
});

// BANNER STORE
const bannerStore = (set: Set<BannerState>, get: Get<BannerState>) => ({
  // initial state
  allBanners: [],
  _lastFetchTime: 0,
  fetchBanners: async () => {
    const allBanners = await getBanners();
    set({ allBanners, _lastFetchTime: Date.now() });
  },
  createBanner: async (banner: BannerFormData) => {
    await createBanner(banner);
    await get().fetchBanners();
  },
  deleteBanner: async (bannerKey: string) => {
    await deleteBanner(bannerKey);
    await get().fetchBanners();
  },
});

// REPORT STORE
const reportStore = (set: Set<ReportState>, get: Get<ReportState>) => ({
  // initial state
  report: undefined, // raw report
  pageMap: undefined, // all page indexes mapped by Id
  rootPage: undefined, // root node
  parentPage: undefined, // active parent (tracks prev/next page)
  currentPageId: undefined,
  modalOpen: false,
  modalHeader: undefined,
  modalComponent: undefined,
  lastSavedTime: undefined,
  errorMessage: undefined,
  sidebarOpen: true,

  // actions
  loadReport: (report: Report | undefined) =>
    set(() => buildState(report, false), false, {
      type: "loadReport",
    }),
  updateReport: (report: Report | undefined) =>
    set(() => buildState(report, true), false, {
      type: "updateReport",
    }),
  setCurrentPageId: (currentPageId: string) =>
    set((state: ReportState) => setPage(currentPageId, state), false, {
      type: "setCurrentPageId",
    }),
  setModalOpen: (modalOpen: boolean) =>
    set(() => ({ modalOpen }), false, { type: "setModalOpen" }),
  setModalComponent: (modalComponent: ReactNode, modalHeader: string) =>
    set(() => ({ modalComponent, modalOpen: true, modalHeader }), false, {
      type: "setModalComponent",
    }),
  setAnswers: (answers: any, pageId?: string) =>
    set((state: ReportState) => mergeAnswers(answers, state, pageId), false, {
      type: "setAnswers",
    }),
  setSidebar: (sidebarOpen: boolean) => {
    set(() => ({ sidebarOpen }), false, { type: "setSidebarOpen" });
  },
  completePage: (pageId: string) => {
    set((state: ReportState) => markPageComplete(pageId, state), false, {
      type: "completePage",
    });
  },
  saveReport: async () => {
    const state = get();
    const result = await saveReport(state);
    set(result, false, { type: "saveReport" });
  },
});

const devToolStore = (set: Set<DevToolsState>) => ({
  devDate: undefined,
  setDevDate: (devDate: string) => {
    set(() => ({ devDate }), false, { type: "setDevToolDate" });
  },
});

export const useStore = create(
  // devtools is being used for debugging state
  persist(
    devtools<UserState & ReportState & BannerState & DevToolsState>(
      (set, get) => ({
        ...userStore(set),
        ...bannerStore(set, get),
        ...reportStore(set, get),
        ...devToolStore(set),
      })
    ),
    {
      name: "rhtp-store",
      partialize: (state) => ({ report: state.report }),
    }
  )
);

/*
 * Zustand doesn't directly export the type signatures of its callbacks.
 * These were manually written to precisely match what Zustand expects,
 * as of Zustand v4.5.2
 *
 * Note that it _is_ possible to access these types indirectly.
 * For example, Set<T> is `Parameters<Parameters<typeof devtools<T>>[0][0]`.
 * However, even though Typescript can handle that, our linter currently cannot.
 * If/when we upgrade our linter, it may be worthwhile to switch to that method.
 */

/** The type of a Set callback within Zustand. */
type Set<TState> = <A extends string | { type: string }>(
  partial:
    | TState
    | Partial<TState>
    | ((state: TState) => TState | Partial<TState>),
  replace?: boolean,
  action?: A
) => void;

/** The type of a Get callback within Zustand. */
type Get<TState> = () => TState;
