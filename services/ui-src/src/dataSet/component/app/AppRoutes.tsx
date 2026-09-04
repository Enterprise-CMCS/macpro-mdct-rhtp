import { Dashboard } from "dataSet/component/forms/Dashboard";
import { ReportAutosaveProvider } from "components/report/ReportAutosaveProvider";
import { Route, Routes } from "react-router";

export const AppRoutes = () => {
  return (
    <main id="main-content" tabIndex={-1}>
      <ReportAutosaveProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </ReportAutosaveProvider>
    </main>
  );
};
