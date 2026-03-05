import { Accordion, Box, Button } from "@chakra-ui/react";
import { Page } from "components/report/Page";
import { AccordionItem } from "components";
import { PageElementProps } from "components/report/Elements";
import { AccordionGroupTemplate, PageElement } from "types";
import { useState } from "react";

export const AccordionGroup = (
  props: PageElementProps<AccordionGroupTemplate>
) => {
  const { accordions } = props.element;
  const [accordionState, setAccordionState] = useState<number[] | undefined>(
    []
  );

  const setAccordionChildren = (element: PageElement[], index: number) => {
    const updatedAnswer = accordions[index];

    props.updateElement({
      accordions: [
        ...accordions.slice(0, index),
        { ...updatedAnswer, children: element },
        ...accordions.slice(index + 1),
      ],
    });
  };

  const expandAll = () => {};

  const collapseAll = () => {};

  return (
    <Box>
      <Button onClick={expandAll}>Expand all</Button>
      <Button onClick={collapseAll}>Collapse all</Button>
      <Accordion allowMultiple index={accordionState} allowToggle>
        {accordions.map((accordion, index) => (
          <AccordionItem label={accordion.label}>
            <Page
              id="radio-children"
              setElements={(element) => setAccordionChildren(element, index)}
              elements={accordion.children}
            />
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};
