import { ReportState } from "types";
import {
  ElementType,
  PageStatus,
  PageType,
  Report,
  ReportStatus,
  ReportType,
  TextboxTemplate,
  FormPageTemplate,
} from "types/report";
import {
  buildState,
  mergeAnswers,
  setPage,
  saveReport,
  deepEquals,
  deepMerge,
} from "./reportActions";

jest.mock("../../api/requestMethods/report", () => ({
  putReport: jest.fn(),
}));
const testReport: Report = {
  type: ReportType.RHTP,
  name: "plan id",
  year: 2026,
  options: {},
  state: "NJ",
  id: "NJXYZ123",
  status: ReportStatus.NOT_STARTED,
  archived: false,
  submissionCount: 0,
  pages: [
    {
      id: "root",
      childPageIds: ["general-info", "req-measure-result"],
    },
    {
      id: "general-info",
      title: "General Information",
      type: PageType.Standard,
      status: PageStatus.NOT_STARTED,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          id: "",
          text: "General Information",
        },
        {
          type: ElementType.Textbox,
          id: "",
          label: "Contact title",
          required: true,
          helperText:
            "Enter person's title or a position title for CMS to contact with questions about this request.",
        },
      ],
    },
    {
      id: "req-measure-result",
      title: "Required Measure Results",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          id: "",
          text: "Required Measure Results",
        },
      ],
    },
  ],
};

describe("reportActions", () => {
  describe("state/management/reportState: buildState", () => {
    test("initializes relevant parts of the state", () => {
      const result = buildState(testReport, false);
      expect(result.pageMap!.size).toEqual(3);
      expect(result.report).not.toBeUndefined();
      expect(result.rootPage).not.toBeUndefined();
      expect(result.parentPage?.parent).toEqual("root");
      expect(result.currentPageId).toEqual("general-info");
    });

    test("returns early when no report provided", () => {
      const result = buildState(undefined, false);
      expect(result.report).toBeUndefined();
    });
  });

  describe("state/management/reportState: setPage", () => {
    test("updates the page info", () => {
      const state = buildState(testReport, false) as ReportState;
      const result = setPage("req-measure-result", state);
      expect(result.currentPageId).toEqual("req-measure-result");
    });
  });

  describe("deepEquals", () => {
    test("Rejects values with different types", () => {
      const obj1 = { foo: "123" };
      const obj2 = { foo: 123 };
      expect(deepEquals(obj1, obj2)).toBe(false);
      expect(deepEquals(obj2, obj1)).toBe(false);
    });

    test("Rejects arrays with different lengths", () => {
      const obj1 = [1, 2, 3];
      const obj2 = [1, 2];
      expect(deepEquals(obj1, obj2)).toBe(false);
      expect(deepEquals(obj2, obj1)).toBe(false);
    });

    test("Rejects arrays with different contents", () => {
      const obj1 = ["a", "b", "c"];
      const obj2 = ["a", "b", "x"];
      expect(deepEquals(obj1, obj2)).toBe(false);
      expect(deepEquals(obj2, obj1)).toBe(false);
    });

    test("Rejects objects with different shapes", () => {
      const obj1 = { foo: "bar" };
      const obj2 = { foo: "bar", baz: "quux" };
      expect(deepEquals(obj1, obj2)).toBe(false);
      expect(deepEquals(obj2, obj1)).toBe(false);
    });

    test("Rejects an object and null", () => {
      // null is a special case because `typeof null === "object"`
      const obj1 = { foo: "bar" };
      const obj2 = null;
      expect(deepEquals(obj1, obj2)).toBe(false);
      expect(deepEquals(obj2, obj1)).toBe(false);
    });

    test("Accepts NaN and NaN", () => {
      // NaN is a special case because `(NaN === NaN) === false`
      const obj1 = NaN;
      const obj2 = NaN;
      expect(deepEquals(obj1, obj2)).toBe(true);
    });

    test("Accepts normal values", () => {
      const obj1 = {
        bool: true,
        num: 123,
        obj: { foo: "bar" },
        str: "hello",
        nul: null,
        arr: [1, 2, 3],
      };
      const obj2 = deepMerge(obj1, {});
      expect(deepEquals(obj1, obj2)).toBe(true);
      expect(deepEquals(obj2, obj1)).toBe(true);
    });

    test("Accepts weird values", () => {
      /*
       * I call these values are "weird" because JSON.stringify mangles them.
       * That makes testing difficult, since we mock structuredClone with JSON,
       * and our answer-merging code relies on structuredClone.
       */
      const obj1 = {
        bigint: 456n,
        undef: undefined,
        nan: NaN,
        negz: -0,
        inf: Infinity,
        dat: new Date(2025, 8, 1),
      };
      const obj2 = {
        bigint: 456n,
        undef: undefined,
        nan: NaN,
        negz: -0,
        inf: Infinity,
        dat: new Date(2025, 8, 1),
      };
      expect(deepEquals(obj1, obj2)).toBe(true);
    });

    test("Rejects really weird values", () => {
      /*
       * For symbols and functions, identical definitions yield unequal objects.
       * That's really weird, you might say.
       * If we ever embed functions or symbols into report bodies,
       * we may have to write special-case code to handle these.
       */
      expect(deepEquals({ x: Symbol("💿") }, { x: Symbol("💿") })).toBe(false);
      expect(deepEquals({ x: () => {} }, { x: () => {} })).toBe(false);
    });
  });

  describe("state/management/reportState: mergeAnswers", () => {
    test("Adds answers to a question", () => {
      const state = buildState(testReport, false) as ReportState;

      const answers = { elements: [null, { answer: "ANSWERED" }] };
      const result = mergeAnswers(answers, state);

      const page = result?.report?.pages[1] as FormPageTemplate;
      const elements = page?.elements!;
      const question = elements[1] as TextboxTemplate;
      expect(page.status).toEqual(PageStatus.IN_PROGRESS);
      expect(question.answer).toEqual("ANSWERED");
    });
  });

  describe("state/management/reportState: saveReport", () => {
    test("updates store on success", async () => {
      const state = buildState(testReport, false) as ReportState;
      const result = await saveReport(state);
      expect(result?.lastSavedTime).toBeTruthy();
    });
  });
});
