// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=1445-2608
// source=src/components/ProjectCard.astro
// component=ProjectCard
import figma from "figma";

const instance = figma.selectedInstance;

/* The label lives in a nested `text-wrap`, but ProjectCard takes it as a
   string prop rather than as slotted content, so it is read through. The
   image and destination are page data — they come from the caller, not Figma. */
const labelLayer = instance.findText("text", { traverseInstances: true });
const label = labelLayer && labelLayer.type === "TEXT" ? labelLayer.textContent : "";

export default {
  example: figma.code`<ProjectCard
  variant="cover"
  label="${label}"
  image={image}
  imageAlt={imageAlt}
  href={href}
/>`,
  imports: ['import ProjectCard from "@/components/ProjectCard.astro";'],
  id: "project-card",
  metadata: { nestable: true },
};
