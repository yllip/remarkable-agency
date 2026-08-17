// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=162-59
// source=src/components/Button.astro
// component=Button
import figma from "figma";

const instance = figma.selectedInstance;

/* `State` (Default | Hovered) has no code prop — the hover treatment lives in
   Button.astro's own stylesheet, so the variant is intentionally not mapped. */
const variant = instance.getEnum("Style", {
  Primary: "primary",
  Secondary: "secondary",
});

const labelLayer = instance.findText("Button Text");
const label = labelLayer && labelLayer.type === "TEXT" ? labelLayer.textContent : "";

export default {
  example: figma.code`<Button variant="${variant}">${label}</Button>`,
  imports: ['import Button from "@/components/Button.astro";'],
  id: "button",
  metadata: { nestable: true },
};
