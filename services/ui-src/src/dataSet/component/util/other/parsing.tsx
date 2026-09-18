import { Button } from "@chakra-ui/react";
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

export const optionalTag = (element: {
  label: string;
  required: boolean;
  skipOptionalTag?: boolean;
}) => {
  const skipOptionalTag = element.skipOptionalTag ?? false;
  return (
    <>
      {element.label}
      {!skipOptionalTag &&
        (element.required ? (
          <span className="requiredText">Required</span>
        ) : (
          <span className="optionalText"> (optional)</span>
        ))}
    </>
  );
};

export const parseHintText = (
  element: {
    helperText?: string;
    helperTextLink?: { link: string; text: string; label: string };
  },
  setModalComponent: (content: string, header: string) => void
) => {
  const link = element.helperTextLink?.link;
  const label = element.helperTextLink?.label;
  const text = element.helperTextLink?.text;

  return (
    (element.helperText || link) && (
      <span className="column">
        {element.helperText && parseHtml(element.helperText)}
        {link && (
          <Button
            variant="link"
            fontSize="14px"
            onClick={() => {
              setModalComponent(parseHtml(text ?? ""), label ?? "");
            }}
            textAlign="left"
          >
            {link}
          </Button>
        )}
      </span>
    )
  );
};

export const format_mdy_to_ymd = (dateString: string) => {
  const [m, d, y] = dateString.split("/");
  return [y, m, d].join("-");
};

export const format_ymd_to_mdy = (dateString: string) => {
  const [y, m, d] = dateString.split("-");
  return [m, d, y].join("/");
};
