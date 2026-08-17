// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=1447-2713
// source=src/components/ButtonWrapper.astro
// component=ButtonWrapper
import figma from "figma";

const instance = figma.selectedInstance;

/* The wrapper holds one or more button instances. They are resolved through
   their own templates rather than named, so a swapped button still renders. */
const buttons = instance.findLayers((node) => node.type === "INSTANCE");

const first =
  buttons[0] && buttons[0].type === "INSTANCE"
    ? buttons[0].executeTemplate().example
    : undefined;
const second =
  buttons[1] && buttons[1].type === "INSTANCE"
    ? buttons[1].executeTemplate().example
    : undefined;
const third =
  buttons[2] && buttons[2].type === "INSTANCE"
    ? buttons[2].executeTemplate().example
    : undefined;

export default {
  example: figma.code`<ButtonWrapper>${first}${second}${third}</ButtonWrapper>`,
  imports: ['import ButtonWrapper from "@/components/ButtonWrapper.astro";'],
  id: "button-wrapper",
  metadata: { nestable: true },
};
