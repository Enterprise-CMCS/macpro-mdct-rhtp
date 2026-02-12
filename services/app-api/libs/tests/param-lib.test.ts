import { proxyEvent } from "../../testing/proxyEvent";
import { parseReportTypeAndState, parseReportParameters } from "../param-lib";

describe("Path parameter parsing", () => {
  describe("parseReportTypeAndState", () => {
    test("should validate report type and state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "RHTP", state: "CO" },
      };
      const result = parseReportTypeAndState(event)!;
      expect(result).toBeDefined();
      expect(result.reportType).toBe("RHTP");
      expect(result.state).toBe("CO");
    });

    test("should return false for invalid report type", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "XX", state: "CO" },
      };
      const result = parseReportTypeAndState(event);
      expect(result).toBeUndefined();
    });

    test("should return false for invalid state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "RHTP", state: "XX" },
      };
      const result = parseReportTypeAndState(event);
      expect(result).toBeUndefined();
    });
  });

  describe("parseReportParameters", () => {
    test("should validate report type and state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "RHTP", state: "CO", id: "foo" },
      };
      const result = parseReportParameters(event)!;
      expect(result).toBeDefined();
      expect(result.reportType).toBe("RHTP");
      expect(result.state).toBe("CO");
      expect(result.id).toBe("foo");
    });

    test("should return false for invalid report type", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "XX", state: "CO", id: "foo" },
      };
      const result = parseReportParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return false for invalid state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "RHTP", state: "XX", id: "foo" },
      };
      const result = parseReportParameters(event);
      expect(result).toBeUndefined();
    });

    test("should return false for missing report ID", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { reportType: "RHTP", state: "CO" },
      };
      const result = parseReportParameters(event);
      expect(result).toBeUndefined();
    });
  });
});
