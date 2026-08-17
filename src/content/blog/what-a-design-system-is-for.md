---
title: What a design system is actually for
description: A component library isn't the point. The point is that the next page takes a day instead of a week, and still looks like it belongs.
tag: Design Systems
pubDate: 2024-02-20
heroImage: ../../assets/images/project-sugar-stone.jpg
heroImageAlt: A woman looking upward as pastel confections fall around her
---

Design systems get sold on consistency, which undersells them. Consistency is a side effect. The real return is that decisions stop being remade — and remaking decisions is where most of a project's time goes.

## Tokens before components

A component built on hard-coded values is a component that has to be edited when the brand shifts. Spacing, type, colour and radius belong in one place, and everything downstream reads from it. Retheming then becomes a change to a handful of values rather than a sweep through every file.

## Fewer components, better ones

A library of eighty components nobody can find is worse than a library of fifteen that cover ninety per cent of the work. When a new pattern appears, the first question is whether an existing component can grow a variant, not whether a new one is warranted.

## Document the reasoning

The note that saves the most time isn't "this is the card component". It's "the card matches its neighbours' height so the dates along the bottom line up" — the reason, so the next person doesn't undo it by accident.

## Let it be incomplete

A system that has to be finished before it's used never gets used. Ours start with tokens and half a dozen components, and grow out of real pages.

Measured properly, a design system's value shows up in the pages built after it, not in the library itself.
