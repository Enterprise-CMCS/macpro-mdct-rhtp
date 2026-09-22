import { Dashboard } from "dataSet/component/forms/Dashboard";
import { AdminDashboard } from "dataSet/component/forms/AdminDashboard";
import { ReportAutosaveProvider } from "components/report/ReportAutosaveProvider";
import { useStore } from "utils";
import { Route, Routes } from "react-router";
import {
  AccessDeniedPage,
  ExportFilesPage,
  NotFoundPage,
  ManageDataSets,
} from "components";

export const AppRoutes = () => {
  const { userIsAdmin } = useStore().user ?? {};

  return (
    <main id="main-content" tabIndex={-1}>
      <ReportAutosaveProvider>
        <Routes>
          <Route
            path="/"
            element={!userIsAdmin ? <Dashboard /> : <AdminDashboard />}
          />
          <Route path="/export" element={<ExportFilesPage />} />
          <Route path="/403" element={<AccessDeniedPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/data-sets" element={<ManageDataSets />} />
        </Routes>
      </ReportAutosaveProvider>
    </main>
  );
};
