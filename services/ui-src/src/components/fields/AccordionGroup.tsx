import { Accordion, Box, Button } from "@chakra-ui/react";
import { Page } from "components/report/Page";
import { AccordionItem, Alert } from "components";
import { PageElementProps } from "components/report/Elements";
import {
  AccordionGroupTemplate,
  AlertTypes,
  PageElement,
  cmsStatusThatLocksSPAC,
  DropdownTemplate,
  SPACItemsThatLock,
} from "@rhtp/shared";
import { useState } from "react";

export const AccordionGroup = (
  props: PageElementProps<AccordionGroupTemplate>
) => {
  const { accordions } = props.element;
  const [accordionState, setAccordionState] = useState<number[]>([0]);

  const setAccordionChildren = (element: PageElement[], index: number) => {
    const updatedAnswer = accordions[index];

    props.updateElement({
      accordions: [
        ...accordions.slice(0, index),
        { ...updatedAnswer, elements: element },
        ...accordions.slice(index + 1),
      ],
    });
  };

  const expandAll = () => {
    const items = accordions.reduce((prev: number[], _curr, index) => {
      prev.push(index);
      return prev;
    }, []);

    setAccordionState(items);
  };

  const collapseAll = () => {
    setAccordionState([]);
  };

  const toggle = (index: number) => {
    if (accordionState.includes(index)) {
      setAccordionState(accordionState.filter((number) => number != index));
    } else {
      setAccordionState([...accordionState, index]);
    }
  };

  if (accordions.length === 0) return;

  const mapAccordionElements = (
    elements: PageElement[],
    isSPACLocked: boolean
  ): PageElement[] => {
    return elements.map((element) => {
      return {
        ...element,
        disabled: isSPACLocked && SPACItemsThatLock.includes(element.id),
      };
    });
  };

  const isSPACLocked = (elements: PageElement[]): boolean => {
    const cmsStatusDropdown = elements.find(
      (element) => element.id === "cms-status-evaluation"
    ) as DropdownTemplate;

    if (!cmsStatusDropdown) return false;

    return cmsStatusThatLocksSPAC.includes(cmsStatusDropdown.answer ?? "");
  };

  return (
    <Box width="100%">
      <Box padding="1.5rem">
        <Button
          onClick={expandAll}
          variant="link"
          marginRight="1.5rem"
          fontWeight="bold"
        >
          Expand all
        </Button>
        <Button onClick={collapseAll} variant="link" fontWeight="bold">
          Collapse all
        </Button>
      </Box>
      <Accordion allowMultiple variant="border" index={accordionState}>
        {accordions.map((accordion, index) => {
          const isLocked = isSPACLocked(accordion.elements);
          return (
            <AccordionItem
              key={`${accordion.label}-${index}`}
              label={accordion.label}
              onClick={() => toggle(index)}
            >
              {isLocked && (
                <Alert
                  status={AlertTypes.INFO}
                  title="State Policy Commitment locked from editing due to status."
                ></Alert>
              )}

              <Page
                id="radio-children"
                setElements={(element) => setAccordionChildren(element, index)}
                elements={mapAccordionElements(accordion.elements, isLocked)}
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};
