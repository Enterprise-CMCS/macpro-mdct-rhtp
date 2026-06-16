import {
  ActionTableTemplate,
  ElementType,
  FormPageTemplate,
  ListInputTemplate,
  PageElement,
  PageStatus,
  RadioTemplate,
  Report,
  TextboxTemplate,
  UseOfFundsAttachmentTemplate,
} from "@rhtp/shared";
import {
  elementSatisfiesRequired,
  inferredReportStatus,
  pageInProgress,
  pageIsCompletable,
} from "./completeness";

describe("inferredReportStatus", () => {
  test("handles different rollup types", () => {
    const report = {
      pages: [
        {
          id: "general-id",
          required: true,
          title: "a title",
          elements: [
            {
              id: "good-question",
              type: ElementType.Textbox,
              answer: "Good",
              required: true,
            },
          ],
        },
        {
          id: "other-id",
          required: true,
          title: "a title",
          elements: [
            {
              id: "no-question",
              type: ElementType.Textbox,
              answer: undefined,
              required: true,
            },
          ],
        },
      ],
    } as any;
    expect(inferredReportStatus(report, "general-id")).toEqual(
      PageStatus.COMPLETE
    );
    expect(inferredReportStatus(report, "other-id")).toEqual(
      PageStatus.NOT_STARTED
    );
  });
});

describe("pageInProgress", () => {
  const isInProgress = (element: object) => {
    const report = {
      pages: [
        {
          id: "mock-page-id",
          elements: [element as PageElement],
        },
      ],
    } as Report;
    return pageInProgress(report, "mock-page-id");
  };

  test("should treat missing or empty answers as not in progress", () => {
    expect(isInProgress({})).toBe(false);
    expect(isInProgress({ answer: undefined })).toBe(false);
    expect(isInProgress({ answer: "" })).toBe(false);
  });

  test("should treat numeric answers as in progress", () => {
    expect(isInProgress({ answer: 0 })).toBe(true);
    expect(isInProgress({ answer: 42 })).toBe(true);
  });

  test("should treat empty answer objects as not in progress", () => {
    expect(isInProgress({ answer: {} })).toBe(false);
    expect(isInProgress({ answer: [] })).toBe(false);
    expect(isInProgress({ answer: [{}, {}] })).toBe(false);
    expect(isInProgress({ answer: { x: [{}] } })).toBe(false);
  });

  test("should treat answers with data in progress", () => {
    expect(isInProgress({ answer: "hello" })).toBe(true);
    expect(isInProgress({ answer: [1, 2] })).toBe(true);
    expect(isInProgress({ answer: [{ x: 42 }] })).toBe(true);
    expect(isInProgress({ answer: { x: [96, 78] } })).toBe(true);
  });

  test("should treat unknown data types as in progress", () => {
    // We don't, and should never, have a BigInt answer type. But if we did:
    expect(isInProgress({ answer: 99n })).toBe(true);
  });
});

describe("pageIsCompletable", () => {
  test("handles empty conditions", () => {
    const missingPageReport = {
      pages: [] as FormPageTemplate[],
    } as Report;
    expect(pageIsCompletable(missingPageReport, "root")).toBeFalsy();

    const noElementsOnPage = {
      pages: [{ id: "root" }],
    } as Report;
    expect(pageIsCompletable(noElementsOnPage, "root")).toBeTruthy();
  });

  test("false when incomplete element", () => {
    const report = {
      pages: [
        {
          id: "my-id",
          status: PageStatus.IN_PROGRESS,
          elements: [
            {
              id: "bad-question",
              type: ElementType.Radio,
              answer: undefined,
              required: true,
            },
          ],
        },
      ],
    } as Report;
    expect(pageIsCompletable(report, "my-id")).toBeFalsy();
  });

  test("succeeds when complete element", () => {
    const report = {
      pages: [
        {
          id: "my-id",
          status: PageStatus.IN_PROGRESS,
          elements: [
            {
              id: "good-question",
              type: ElementType.Textbox,
              answer: "WOW",
              required: true,
            },
          ],
        },
      ],
    } as Report;
    expect(pageIsCompletable(report, "my-id")).toBeTruthy();
  });
  test("is completable when element type is an AccordionGroup", () => {
    const report = {
      pages: [
        {
          id: "my-id",
          status: PageStatus.IN_PROGRESS,
          elements: [
            {
              type: ElementType.AccordionGroup,
              id: "accordion",
              accordions: [
                {
                  label: "",
                  children: [
                    {
                      id: "good-question",
                      type: ElementType.Textbox,
                      answer: "WOW",
                      required: true,
                    },
                  ],
                },
              ],
              required: true,
            },
          ],
        },
      ],
    } as Report;
    expect(pageIsCompletable(report, "my-id")).toBeTruthy();
  });
  test("is completable when pageId is initiatives ", () => {
    const report = {
      pages: [
        {
          id: "initiatives",
          status: PageStatus.IN_PROGRESS,
          elements: [{}],
        },
        {
          id: "init-123",
          initiativeNumber: "123",
          elements: [
            {
              id: "good-question",
              type: ElementType.Textbox,
              answer: "WOW",
              required: true,
            },
          ],
        },
      ],
    } as Report;
    expect(pageIsCompletable(report, "initiatives")).toBeTruthy();
  });
});

describe("elementSatisfiesRequired", () => {
  test("returns true when hidden or not required", () => {
    const hiddenElement: TextboxTemplate = {
      id: "other-element",
      label: "hidden textbox",
      answer: "foo",
      type: ElementType.Textbox,
      required: true,
    };
    const notRequired: TextboxTemplate = {
      id: "not-element",
      label: "optional textbox",
      answer: "foo",
      type: ElementType.Textbox,
      required: false,
    };
    const otherElement: TextboxTemplate = {
      id: "other-element",
      label: "irrelevant other textbox",
      answer: "foo",
      type: ElementType.Textbox,
      required: false,
    };
    const elements = [otherElement, hiddenElement, notRequired];
    expect(elementSatisfiesRequired(hiddenElement, elements)).toBeTruthy();
    expect(elementSatisfiesRequired(notRequired, elements)).toBeTruthy();
  });

  test("handles radios", () => {
    const radio = {
      id: "other-element",
      answer: "foo",
      type: ElementType.Radio,
      choices: [
        {
          label: "me",
          value: "me",
        },
      ],
      required: true,
    } as RadioTemplate;
    const incompleteChildren = {
      id: "bad-element",
      answer: "me",
      type: ElementType.Radio,
      choices: [
        {
          label: "me",
          value: "me",
          checkedChildren: [
            {
              type: ElementType.Textbox,
              answer: undefined,
              required: true,
            },
          ],
        },
      ],
      required: true,
    } as RadioTemplate;
    const radios = [radio, incompleteChildren];
    expect(elementSatisfiesRequired(radio, radios)).toBeTruthy();
    expect(elementSatisfiesRequired(incompleteChildren, radios)).toBeFalsy();
  });

  test("reject incomplete ListInput", () => {
    const element = {
      type: ElementType.ListInput,
      required: false,
      answer: [""],
    } as ListInputTemplate;
    expect(elementSatisfiesRequired(element, [element])).toBeFalsy();
  });

  test("handles Metrics Table", () => {
    const element = {
      type: ElementType.ActionTable,
      id: "metrics-table",
      label: "action table",
      hintText: "hint text",
      modal: { title: "", elements: [] },
      rows: [{ id: "row", type: ElementType.Paragraph, header: "" }],
      answer: [[{ id: "row", value: "2" as string }]],
      required: true,
    } as ActionTableTemplate;
    expect(elementSatisfiesRequired(element, [element])).toBeTruthy();
  });

  test("handles UseOfFundsAttachment", () => {
    const element = {
      type: ElementType.UseOfFundsAttachment,
      id: "use-of-funds",
      answer: [{ name: "mock-file-name", size: 100, fileId: "mock-id" }],
      required: true,
    } as UseOfFundsAttachmentTemplate;
    expect(elementSatisfiesRequired(element, [element])).toBeTruthy();
  });
});
