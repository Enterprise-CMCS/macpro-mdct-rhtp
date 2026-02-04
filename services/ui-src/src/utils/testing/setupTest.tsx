import React from "react";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import * as framerMotion from "framer-motion";
import {
  UserRoles,
  UserState,
  AdminBannerState,
  ReportState,
  ReportType,
  ReportStatus,
} from "types";
import { mockBannerData } from "./mockBanner";

/*
 * @testing-library defines custom matchers for DOM nodes.
 * It allows us to assert things like:
 *     expect(element).toHaveTextContent(/react/i)
 * Learn more: https://github.com/testing-library/jest-dom
 * Since vitest is so jest-like, there is no separate TL package for it.
 */
expect.extend(domMatchers);

// for accessibility testing
import "vitest";
import type { AxeMatchers } from "vitest-axe";

declare module "vitest" {
  export interface Assertion extends AxeMatchers {}
  export interface AsymmetricMatchersContaining extends AxeMatchers {}
}

// GLOBALS

global.React = React;

global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));

framerMotion.MotionGlobalConfig.skipAnimations = true;

/* Mocks window.matchMedia (https://bit.ly/3Qs4ZrV) */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.scrollBy = vi.fn();
window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

/* Mock Amplify */
vi.mock("aws-amplify/api", () => ({
  get: vi.fn().mockImplementation(() => ({
    response: Promise.resolve({
      body: {
        text: () => Promise.resolve(`{"json":"blob"}`),
      },
    }),
  })),
  post: vi.fn().mockImplementation(() => ({
    response: Promise.resolve({
      body: {
        text: () => Promise.resolve(`{"json":"blob"}`),
      },
    }),
  })),
  put: vi.fn().mockImplementation(() => ({
    response: Promise.resolve({
      body: {
        text: () => Promise.resolve(`{"json":"blob"}`),
      },
    }),
  })),
  del: vi.fn().mockImplementation(() => ({
    response: Promise.resolve({
      body: {
        text: () => Promise.resolve(`{"json":"blob"}`),
      },
    }),
  })),
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockReturnValue({
    idToken: () => ({
      payload: "eyJLongToken",
    }),
  }),
  signOut: vi.fn().mockImplementation(() => Promise.resolve()),
  signInWithRedirect: () => {},
}));

//  BANNER STATES / STORE

export const mockBannerStore: AdminBannerState = {
  bannerData: mockBannerData,
  bannerActive: false,
  bannerLoading: false,
  bannerErrorMessage: { title: "", children: undefined },
  bannerDeleting: false,
  setBannerData: () => {},
  clearAdminBanner: () => {},
  setBannerActive: () => {},
  setBannerLoading: () => {},
  setBannerErrorMessage: () => {},
  setBannerDeleting: () => {},
};

// USER STATES / STORE

export const mockNoUserStore: UserState = {
  user: undefined,
  showLocalLogins: true,
  setUser: () => {},
  setShowLocalLogins: () => {},
};

export const mockStateUserStore: UserState = {
  user: {
    userRole: UserRoles.STATE_USER,
    email: "stateuser@test.com",
    given_name: "Thelonious",
    family_name: "States",
    full_name: "Thelonious States",
    state: "MN",
    userIsEndUser: true,
  },
  showLocalLogins: true,
  setUser: () => {},
  setShowLocalLogins: () => {},
};

export const mockHelpDeskUserStore: UserState = {
  user: {
    userRole: UserRoles.HELP_DESK,
    email: "helpdeskuser@test.com",
    given_name: "Clippy",
    family_name: "Helperson",
    full_name: "Clippy Helperson",
    state: undefined,
    userIsReadOnly: true,
  },
  showLocalLogins: false,
  setUser: () => {},
  setShowLocalLogins: () => {},
};

export const mockAdminUserStore: UserState = {
  user: {
    userRole: UserRoles.ADMIN,
    email: "adminuser@test.com",
    given_name: "Adam",
    family_name: "Admin",
    full_name: "Adam Admin",
    state: undefined,
    userIsAdmin: true,
  },
  showLocalLogins: false,
  setUser: () => {},
  setShowLocalLogins: () => {},
};

export const mockReportStore: ReportState = {
  modalOpen: false,
  sidebarOpen: true,
  currentPageId: "root",
  pageMap: new Map([
    ["root", 0],
    ["MOCK-1", 1],
    ["MOCK-2", 2],
  ]),
  report: {
    id: "mock-id",
    type: ReportType.RHTP,
    status: ReportStatus.IN_PROGRESS,
    name: "mock-report-title",
    year: 2026,
    state: "PA",
    archived: false,
    submissionCount: 0,
    pages: [
      {
        id: "root",
        childPageIds: ["MOCK-1", "MOCK-2"],
      },
    ],
  },
  loadReport: () => {},
  updateReport: () => {},
  setCurrentPageId: () => {},
  setModalOpen: () => {},
  setModalComponent: () => {},
  setAnswers: () => {},
  setSidebar: () => {},
  completePage: () => {},
  saveReport: async () => {},
};

// BOUND STORE

export const mockUseStore: UserState & AdminBannerState & ReportState = {
  ...mockStateUserStore,
  ...mockBannerStore,
  ...mockReportStore,
};

export const mockUseAdminStore: UserState & AdminBannerState = {
  ...mockAdminUserStore,
  ...mockBannerStore,
};

export const mockUseReadOnlyUserStore: UserState & AdminBannerState = {
  ...mockHelpDeskUserStore,
  ...mockBannerStore,
  ...mockReportStore,
};

// BANNER
export * from "./mockBanner";
// ROUTER
export * from "./mockRouter";
