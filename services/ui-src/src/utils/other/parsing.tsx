import { optionalInQuarterly, RhtpSubType } from "@rhtp/shared";
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

export const optionalTag = (
  element: { label: string; required: boolean; id: string },
  subType?: RhtpSubType
) => {
  if (!element.label) return "";

  const setTag = () => {
    if (!element.required) {
      return { show: true, text: "optional" };
    } else {
      //currently only used for Initiative -> Narrative textarea field
      if (
        optionalInQuarterly.includes(element.id) &&
        subType === RhtpSubType.ANNUAL
      ) {
        return { show: true, text: "Required Annually" };
      }
    }
    return { show: false, text: "" };
  };

  const tag = setTag();

  return (
    <>
      {element.label}
      {tag.show && <span className="optionalText"> ({tag.text})</span>}
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
  const { link, label, text } = element.helperTextLink!;

  return (
    element.helperText && (
      <span className="column">
        {parseHtml(element.helperText)}
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
