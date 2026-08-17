---
title: Accessibility is a design decision, not a checklist
description: Most accessibility failures are settled long before anyone writes markup — in a colour pair, a type size, or a control that only exists on hover.
tag: Accessibility
pubDate: 2023-11-08
heroImage: ../../assets/images/project-mystic-haven.jpg
heroImageAlt: A traveller walking a colonnaded street in a hillside town
---

By the time a build is audited, the expensive problems are already baked in. The contrast was decided in the palette, the tap target was decided in the component, the focus behaviour was decided by a pattern nobody questioned. An audit at that point produces a list of compromises rather than fixes.

## Decide contrast in the palette

Pick colour pairs that pass at the sizes they'll be used at, and record them as pairs. A palette that only documents the individual colours invites combinations that were never checked.

## Design the focused state

Every interactive element has a focused state whether or not anyone drew it. If it isn't in the design system, the browser default has to survive whatever background it lands on — and on a dark hero it usually doesn't.

## Don't hide controls behind hover

Anything revealed only on hover is unavailable on touch and to keyboard users. If a control matters, it's visible; if it doesn't matter, it probably doesn't need to be there.

## Motion is a preference, not a given

Respect `prefers-reduced-motion` in the component, not as a global override added later. The animation that reads as polish to one visitor is a genuine problem for another.

None of these are difficult. They're just decisions that are cheap early and costly late.
