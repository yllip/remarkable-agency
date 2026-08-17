// url=https://www.figma.com/design/MvhMPQjN5fsBH6jA7e6AP2/Remarkable-Studio--Community-?node-id=1440-1299
// source=src/components/PostCard.astro
// component=PostCard
import figma from "figma";

const instance = figma.selectedInstance;

/* Three layers in this card are named `text`: the category pill, the heading,
   and the date inside the nested `text-wrap`. The pill is the only one with a
   frame of its own on the path, so it is found by that; the heading is the
   remaining direct one — `findLayers` stops at the instance boundary, so the
   date is not among these. The date and destination are page data in code. */
const tagLayer = instance.findText("text", { path: ["Frame 33"] });
const tag = tagLayer && tagLayer.type === "TEXT" ? tagLayer.textContent : "";

const headingLayer = instance
  .findLayers((node) => node.type === "TEXT")
  .find((node) => node.name === "text" && node !== tagLayer);
const heading =
  headingLayer && headingLayer.type === "TEXT" ? headingLayer.textContent : "";

export default {
  example: figma.code`<PostCard
  tag="${tag}"
  heading="${heading}"
  date={date}
  href={href}
/>`,
  imports: ['import PostCard from "@/components/PostCard.astro";'],
  id: "post-card",
  metadata: { nestable: true },
};
