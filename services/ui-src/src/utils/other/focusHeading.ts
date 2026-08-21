export const focusHeading = () => {
  const target =
    document.querySelector("h1") ?? document.querySelector("#main-content");

  target?.setAttribute("tabindex", "-1");
  target?.focus();
  window.scrollTo(0, 0);
};
