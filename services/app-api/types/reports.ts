// Re-export shared types from the shared package
export * from "@rhtp/shared";

// Backend-specific extension to ReportOptions
// This adds copyFromReportId which is only used in backend API operations
export interface CreateReportOptions {
  copyFromReportId?: string;
}

// Note: If you need backend-specific types that don't exist in the shared package,
// add them here. For types that should be shared with the frontend, add them to
// services/shared/src/types/reports.ts instead.
