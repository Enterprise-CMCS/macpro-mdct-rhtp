import { proxyEvent } from "../../testing/proxyEvent";
import {
  parseReportTypeAndState,
  parseReportParameters,
  parseState,
  parseStateAndId,
  parseEmail,
  parseZipIdParameters,
} from "../param-lib";

describe("Path parameter parsing", () => {
  describe("parseEmail", () => {
    test("should check for email", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { email: "test@email.com" },
      };
      const result = parseEmail(event)!;
      expect(result).toBeDefined();
      expect(result.email).toBe("test@email.com");
    });

    test("should return false for missing email", () => {
      const event = {
        ...proxyEvent,
        pathParameters: {},
      };
      const result = parseEmail(event);
      expect(result).toBeUndefined();
    });
  });

  describe("parseState", () => {
    test("should validate state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "CO" },
      };
      const result = parseState(event)!;
      expect(result).toBeDefined();
      expect(result.state).toBe("CO");
    });

    test("should return false for invalid state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "XX" },
      };
      const result = parseState(event);
      expect(result).toBeUndefined();
    });
  });

  describe("parseStateAndId", () => {
    test("should validate state and id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "CO", id: "123" },
      };
      const result = parseStateAndId(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("123");
      expect(result.state).toBe("CO");
    });

    test("should return false for missing id", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "CO" },
      };
      const result = parseStateAndId(event);
      expect(result).toBeUndefined();
    });

    test("should return false for invalid state", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { state: "XX", id: "123" },
      };
      const result = parseStateAndId(event);
      expect(result).toBeUndefined();
    });
  });

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

  describe("parseZipIdParameters", () => {
    test("should validate zip id exists", () => {
      const event = {
        ...proxyEvent,
        pathParameters: { id: "foo" },
      };
      const result = parseZipIdParameters(event)!;
      expect(result).toBeDefined();
      expect(result.id).toBe("foo");
    });

    test("should return false for missing report ID", () => {
      const event = {
        ...proxyEvent,
        pathParameters: {},
      };
      const result = parseZipIdParameters(event);
      expect(result).toBeUndefined();
    });
  });
});
