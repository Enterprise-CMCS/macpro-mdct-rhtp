import { apiLib } from "./apiLib";

const mockAmplifyApi = require("aws-amplify/api");

const mockUpdateTimeout = vi.fn();

vi.mock("utils/auth/authLifecycle", () => ({
  updateTimeout: mockUpdateTimeout,
}));

const path = "my/url";
const mockOptions = {
  headers: {
    "x-api-key": "mock key",
  },
  body: {
    foo: "bar",
  },
};
const requestObj = {
  apiName: "rhtp",
  path,
  options: mockOptions,
};

describe("API lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Calling post should update the session timeout", async () => {
    const apiSpy = vi.spyOn(mockAmplifyApi, "post");
    await apiLib.post(path, mockOptions);

    expect(apiSpy).toHaveBeenCalledWith(requestObj);
    expect(mockUpdateTimeout).toHaveBeenCalled();
  });

  test("Calling put should update the session timeout", async () => {
    const apiSpy = vi.spyOn(mockAmplifyApi, "put");
    await apiLib.put(path, mockOptions);

    expect(apiSpy).toHaveBeenCalledWith(requestObj);
    expect(mockUpdateTimeout).toHaveBeenCalled();
  });

  test("Calling get should update the session timeout", async () => {
    const apiSpy = vi.spyOn(mockAmplifyApi, "get");
    await apiLib.get(path, mockOptions);

    expect(apiSpy).toHaveBeenCalledWith(requestObj);
    expect(mockUpdateTimeout).toHaveBeenCalled();
  });

  test("Calling del should update the session timeout", async () => {
    const apiSpy = vi.spyOn(mockAmplifyApi, "del");
    await apiLib.del(path, mockOptions);

    expect(apiSpy).toHaveBeenCalledWith(requestObj);
    expect(mockUpdateTimeout).toHaveBeenCalled();
  });

  test("API errors should be surfaced for handling", async () => {
    // For this test only, ignore console output. We deliberately log the error.
    const consoleSpy = vi.spyOn(console, "log");
    consoleSpy.mockImplementation(() => {});

    const apiSpy = vi.spyOn(mockAmplifyApi, "del");
    apiSpy.mockImplementationOnce(() => {
      throw new Error("Mock 500 error");
    });

    await expect(apiLib.del(path, mockOptions)).rejects.toThrow(Error);
    consoleSpy.mockRestore();
  });
});
