import { render, screen } from "@testing-library/react";
import { parseHtml } from "utils";

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
});
