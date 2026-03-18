import { FormPageTemplate, Report, ReportType } from "types";
import { createInitiative, updateInitiative } from "./initiatives";

const report = {
  type: ReportType.RHTP,
  state: "PA",
  name: "A Title",
  pages: [] as FormPageTemplate[],
} as Report;

const mockPost = vi.fn();
const mockPut = vi.fn();
vi.mock("../apiLib", () => ({
  apiLib: {
    post: (path: string, opts: Record<string, any>) => mockPost(path, opts),
    put: (path: string, opts: Record<string, any>) => mockPut(path, opts),
  },
}));

const mockInitiativeCreate = {
  initiativeName: "Mock Initiative Name",
  initiativeNumber: "12345",
  initiativeAttestation: true,
};

const mockInitiativeUpdate = {
  initiativeName: "Mock Initiative Name Change",
  initiativeAbandon: false,
};

describe("initiatives api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("createInitiative", async () => {
    await createInitiative(report, mockInitiativeCreate);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  test("updateInitiative", async () => {
    await updateInitiative(report, mockInitiativeUpdate, "12345");
    expect(mockPut).toHaveBeenCalledTimes(1);
  });
});
