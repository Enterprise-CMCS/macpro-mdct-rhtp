import { Navigate, Route, Routes, useLocation } from "react-router";
import {
  AdminPage,
  HelpPage,
  HomePage,
  ProfilePage,
  DashboardPage,
  AccessDeniedPage,
  NotFoundPage,
  ExportedReportPage,
  ReportPageWrapper,
  ComponentInventory,
  NotificationsPage,
  ExportedZipPage,
} from "components";
import { useStore } from "utils";
import { useEffect, useRef } from "react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { ReportAutosaveProvider } from "components/report/ReportAutosaveProvider";
import { UserRoles } from "@rhtp/shared";

export const AppRoutes = () => {
  const { userIsAdmin, userRole } = useStore().user ?? {};

  const { pathname } = useLocation();
  const isPdfActive = useFlags()?.viewPdf;

  const componentInventoryPageEnabled = useFlags()?.componentInventory;
  const firstRouteRender = useRef(true);

  useEffect(() => {
    if (firstRouteRender.current) {
      firstRouteRender.current = false;
      return;
    }

    const focusHeading = () => {
      const target =
        document.querySelector("h1") ?? document.querySelector("#main-content");

      target?.setAttribute("tabindex", "-1");
      target?.focus();
      window.scrollTo(0, 0);
    };

    // Wait for the next paint
    const rafId = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return (
    <main id="main-content" tabIndex={-1}>
      <ReportAutosaveProvider>
        <Routes>
          {/* General Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin"
            element={!userIsAdmin ? <Navigate to="/profile" /> : <AdminPage />}
          />
          <Route
            path="/notifications"
            element={
              userRole !== UserRoles.APPROVER ? (
                <Navigate to="/profile" />
              ) : (
                <NotificationsPage />
              )
            }
          />
          <Route path="/export" element={<ExportedZipPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/403" element={<AccessDeniedPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/report/:reportType/:state"
            element={<DashboardPage />}
          />
          {isPdfActive && (
            <Route
              path="/report/:reportType/:state/:reportId/export"
              element={<ExportedReportPage />}
            />
          )}
          <Route
            path="/report/:reportType/:state/:reportId/:pageId?"
            element={<ReportPageWrapper />}
          />
          {componentInventoryPageEnabled && (
            <Route
              path="/component-inventory"
              element={<ComponentInventory />}
            />
          )}
        </Routes>
      </ReportAutosaveProvider>
    </main>
  );
};
