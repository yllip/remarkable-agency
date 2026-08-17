// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=1447-2712
// source=src/components/Eyebrow.astro
// component=Eyebrow
import figma from "figma";

const instance = figma.selectedInstance;

const labelLayer = instance.findText("Text");
const label = labelLayer && labelLayer.type === "TEXT" ? labelLayer.textContent : "";

export default {
  example: figma.code`<Eyebrow>${label}</Eyebrow>`,
  imports: ['import Eyebrow from "@/components/Eyebrow.astro";'],
  id: "eyebrow",
  metadata: { nestable: true },
};
