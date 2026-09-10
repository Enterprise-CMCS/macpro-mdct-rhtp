process.env.BannersTable = "local-banners";
process.env.ReportsTable = "local-reports";
process.env.CommentsTable = "local-comments";
process.env.NotificationsTable = "local-notifications";
process.env.NotificationRecipientsTable = "local-notifications-recipients";
process.env.brokerString = "broker1,broker2";
process.env.STAGE = "local";
/*
 * This mock mutes all logger output during tests! Including console errors!
 *
 * Lots of our tests deliberately trigger console logs, warnings, and errors.
 * That adds a lot of noise to the console output of `yarn test` -
 * or it would, if we didn't mute it here.
 *
 * The only test where we need to observe logger output is debug-lib.test.ts,
 * which overrides this mock.
 */
vi.mock("../libs/debug-lib", () => {
  const debug = vi.fn();
  const info = vi.fn();
  const warn = vi.fn();
  const error = vi.fn();
  const logger = { debug, info, warn, error };
  return {
    trace: vi.fn(),
    debug,
    info,
    warn,
    error,
    logger,
    init: vi.fn(),
    flush: vi.fn(),
  };
});

/*
 * Default mock for s3-lib so any code that transitively fetches data from S3
 * (e.g. building the RHTP report template) doesn't attempt real AWS calls
 * during tests. Individual test files can override this with their own
 * `vi.mock("../../libs/s3-lib", ...)` as needed.
 */
vi.mock("../libs/s3-lib", () => ({
  default: {
    deleteObject: vi.fn(),
    headObject: vi.fn(),
    createPresignedPost: vi.fn(),
    getSignedDownloadUrl: vi.fn(),
    getObject: vi.fn().mockResolvedValue({
      Body: { transformToString: () => Promise.resolve("{}") },
    }),
    getObjectTagging: vi.fn(),
    putObject: vi.fn(),
    copyObject: vi.fn(),
  },
}));
