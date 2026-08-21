import { render, screen } from "@testing-library/react";
import {
  parseHtml,
  optionalTag,
  format_mdy_to_ymd,
  format_ymd_to_mdy,
} from "utils";

vi.mock("dompurify", async (importOriginal) => ({
  ...(await importOriginal()),
  sanitize: vi.fn((el) => el),
}));

describe("utils/parsing", () => {
  describe("parseCustomHtml", () => {
    test("should sanitize the input and return renderable React elements", () => {
      const htmlString = "<span><em>test text</em></span>";

      const elements = parseHtml(htmlString);
      render(<>{elements}</>);

      expect(screen.getByText("test text")).toBeInTheDocument();
    });
  });
  describe("optionalTag", () => {
    test("not required elements should have (optional) appended to the label", () => {
      const element = optionalTag({
        label: "mock label",
        required: false,
      });
      render(element);
      expect(screen.getByText("mock label")).toBeInTheDocument();
      expect(screen.getByText("(optional)")).toBeInTheDocument();
    });
    test("required annual elements should have (Required Annually) appended to the label", () => {
      const element = optionalTag({
        label: "mock label",
        required: true,
      });
      render(element);
      expect(screen.getByText("mock label")).toBeInTheDocument();
      expect(screen.getByText("Required")).toBeInTheDocument();
    });
  });
  describe("format date", () => {
    test("should convert date from MM/DD/YYYY to YYYY-MM-DD", () => {
      const element = format_mdy_to_ymd("02/03/2022");
      expect(element).toBe("2022-02-03");
    });
    test("should convert date from YYYY-MM-DD to MM/DD/YYYY", () => {
      const element = format_ymd_to_mdy("2022-02-03");
      expect(element).toBe("02/03/2022");
    });
  });
});
