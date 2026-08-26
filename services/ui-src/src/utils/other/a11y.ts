import {
  ElementType,
  FormPageTemplate,
  ParentPageTemplate,
  tabTitleMap,
} from "@rhtp/shared";

//used to find the first header element on the page, does have issues if the page is loading
export const findPageH1 = () => {
  const target =
    document.querySelector("h1") ?? document.querySelector("#main-content");
  return target;
};

export const focusHeading = () => {
  const target = findPageH1();
  target?.setAttribute("tabindex", "-1");
  target?.focus();
  window.scrollTo(0, 0);
};

export const getTabTitle = (
  pathname: string,
  currentPage: ParentPageTemplate | FormPageTemplate | null
) => {
  //first check to see if we hardcoded a title to a path
  const pathTabTitle = tabTitleMap[pathname as keyof typeof tabTitleMap];

  //when in a report, the tab table should be retrieved from the header element for page consistency
  const reportTabTitle = currentPage?.elements?.find(
    (element) => element.type === ElementType.Header
  )?.text;

  //if not a single tab title is found in the map or page element, pull it from the first h1 element on the page else, it is highly likely not a real page
  if (!pathTabTitle && !reportTabTitle)
    return findPageH1()?.textContent ?? "Page not Found";

  return pathTabTitle ?? `${reportTabTitle} - RHTP`;
};
