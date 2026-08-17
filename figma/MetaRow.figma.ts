// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=1447-2693
// source=src/components/MetaRow.astro
// component=MetaRow
import figma from "figma";

const instance = figma.selectedInstance;

/* `text-wrap` is a label with an up-right arrow pushed to the far edge — the
   row that closes a project card, a featured card and a post card alike. */
const labelLayer = instance.findText("text");
const label = labelLayer && labelLayer.type === "TEXT" ? labelLayer.textContent : "";

export default {
  example: figma.code`<MetaRow>${label}</MetaRow>`,
  imports: ['import MetaRow from "@/components/MetaRow.astro";'],
  id: "meta-row",
  metadata: { nestable: true },
};
