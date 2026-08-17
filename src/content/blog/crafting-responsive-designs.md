---
title: Crafting responsive designs for user engagement
description: Responsive design stopped being about breakpoints a long time ago. What matters now is whether a layout can hold its meaning as the space around it changes.
tag: Web Design
pubDate: 2023-07-04
heroImage: ../../assets/images/project-elder-tech.jpg
heroImageAlt: A man working at a laptop in a plant-filled studio
---

The old approach to responsive work was to draw three layouts and write the CSS that snapped between them. It produced sites that were correct at exactly three widths and approximate everywhere else.

## Design the rules, not the states

A layout is easier to reason about when it's expressed as a relationship: this column is never narrower than this, the gap grows with the viewport, the grid takes as many columns as fit. Modern CSS can express nearly all of it directly, which means fewer breakpoints to maintain and fewer widths where nobody has looked.

## Type is the hard part

Fluid type is where most systems fall apart. Scale the headline with the viewport and it becomes unreadable on a phone held at arm's length; freeze it and the page looks starved on a large display. We clamp every step of the scale between a comfortable minimum and maximum, then check the result at the sizes people actually use rather than the ones in the design file.

## Test the content, not the canvas

The layouts that break in production are the ones that met an unusually long product name, a missing image, or three lines of copy where the design had one. Filling every component with awkward content before launch is the cheapest quality check available.

Engagement follows from a page that reads well wherever it's opened. That's less a visual problem than a structural one.
