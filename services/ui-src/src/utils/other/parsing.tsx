import DOMPurify from "dompurify";
import parse from "html-react-parser";

/** Parse HTML string, sanitize, and return React elements. */
export const parseHtml = (html: string) => {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_ATTR: ["href", "alt", "target", "class", "src"],
  });
  const parsedHtml = parse(sanitizedHtml);
  return parsedHtml;
};

export const bytesToKiloBytes = (bytes: number) => {
  return Math.ceil(bytes / 1000);
};

export const optionalTag = (element: { label: string; required: boolean }) => {
  if (!element.label) return "";

  return (
    <>
      {element.label}
      {!element.required && <span className="optionalText"> (optional)</span>}
    </>
  );
};
