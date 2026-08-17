/**
 * Page motion. Lenis carries the scroll itself, GSAP animates everything that
 * reacts to it, and markup opts in through data attributes so no page needs a
 * script of its own:
 *
 * - `data-intro` — rises into place on load, one after another in DOM order.
 * - `data-split` — splits into `lines` (the default), `words` or `chars` and
 *   wipes them up out of a mask when the element reaches the viewport. Add
 *   `data-intro` alongside it to play on load instead.
 * - `data-reveal` — fades and rises when it reaches the viewport. Anything
 *   arriving at the same moment is staggered as a group.
 * - `data-parallax` — drifts against the scroll, by that percentage of its own
 *   height each way (default 8). For a background that fills a clipped box;
 *   the scale that gives it room is in src/styles/motion.css.
 *
 * None of it runs for a visitor who prefers reduced motion. The rules that
 * hold elements back sit behind the same query, so that page is static rather
 * than blank.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** One feel for the whole page: slow out of the gate, settled at the end. */
const EASE = "power3.out";
const DURATION = 0.9;

/** How far a revealed element travels, in pixels. */
const DISTANCE = 32;

type SplitType = "lines" | "words" | "chars";

/** The smaller the piece, the tighter the gap between them. */
const SPLIT_STAGGER: Record<SplitType, number> = {
  lines: 0.1,
  words: 0.045,
  chars: 0.018,
};

/** Where an element sits in the load sequence. */
type IntroSlot = { timeline: gsap.core.Timeline; at: number };

/**
 * Hands the scroll to Lenis and keeps ScrollTrigger reading from it.
 * Returns the teardown.
 */
function startLenis() {
  /* In-page links are left to the browser. Lenis follows a native jump
     perfectly well, and the skip link should land instantly. */
  const lenis = new Lenis({
    /* GSAP drives the frame instead, so the scroll position and the tweens
       reading it can never be a frame apart. */
    autoRaf: false,
  });

  /* Lenis is the only thing moving the page now, so each of its frames has to
     be a ScrollTrigger update. */
  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  /* Off, so a stalled tab doesn't have GSAP invent a small delta and leave
     the two clocks disagreeing about where the page is. */
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}

/** Splits an element and wipes the pieces up out of their masks. */
function splitReveal(el: HTMLElement, slot: IntroSlot | null) {
  const type = (el.dataset.split || "lines") as SplitType;
  let played = false;

  SplitText.create(el, {
    type,
    mask: type,
    linesClass: "split-line",
    wordsClass: "split-word",
    charsClass: "split-char",
    /* Lines are measured, so they have to be measured again whenever the
       element changes width. Words and chars don't move. */
    autoSplit: type === "lines",
    onSplit(self) {
      const parts = self[type];

      /* The element was hidden whole so the unsplit text never showed. The
         masks take over that job from here. */
      gsap.set(el, { autoAlpha: 1 });

      /* Re-split after the reveal has already run: put the pieces where the
         finished animation left them rather than playing it again. */
      if (played) return gsap.set(parts, { yPercent: 0 });

      const vars: gsap.TweenVars = {
        yPercent: 110,
        duration: DURATION,
        ease: EASE,
        stagger: SPLIT_STAGGER[type],
      };

      if (slot) {
        played = true;
        /* Not returned: SplitText reverts what it is given on a re-split, and
           this belongs to the load sequence, not to this element. */
        slot.timeline.from(parts, vars, slot.at);
        return;
      }

      return gsap.from(parts, {
        ...vars,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            played = true;
          },
        },
      });
    },
  });
}

/** Drifts an element against the scroll for as long as it is in frame. */
function parallax(el: HTMLElement) {
  const amount = Number(el.dataset.parallax) || 8;

  gsap.fromTo(
    el,
    { yPercent: -amount },
    {
      yPercent: amount,
      /* Anything else would break the 1:1 mapping to scroll position. */
      ease: "none",
      scrollTrigger: {
        /* The box it fills, not the oversized element itself. */
        trigger: el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}

function setup() {
  const stopLenis = startLenis();

  const intro = gsap.timeline({
    defaults: { ease: EASE, duration: DURATION },
    /* Long enough that the first frame is the page at rest. */
    delay: 0.15,
  });
  let step = 0;

  /* One pass in document order, so ScrollTriggers are created down the page —
     the order ScrollTrigger refreshes them in. */
  const targets = gsap.utils.toArray<HTMLElement>(
    "[data-intro], [data-split], [data-parallax]",
  );

  for (const el of targets) {
    const slot = el.hasAttribute("data-intro")
      ? { timeline: intro, at: step++ * 0.12 }
      : null;

    if (el.hasAttribute("data-split")) {
      splitReveal(el, slot);
    } else if (slot) {
      intro.fromTo(
        el,
        { opacity: 0, y: DISTANCE },
        { opacity: 1, y: 0 },
        slot.at,
      );
    }

    if (el.hasAttribute("data-parallax")) parallax(el);
  }

  /* Batched rather than one trigger each, so a row of cards crossing the line
     together reads as one staggered move instead of three coincidences. */
  const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  gsap.set(reveals, { opacity: 0, y: DISTANCE });
  ScrollTrigger.batch(reveals, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: DURATION,
        ease: EASE,
        stagger: 0.09,
        overwrite: true,
      }),
  });

  /* A transparent bar over a hero needs a surface once the page has moved
     under it. The class is styled in src/styles/motion.css. */
  const nav = document.querySelector<HTMLElement>("[data-nav].overlap");
  if (nav) {
    ScrollTrigger.create({
      /* The page itself is the trigger: on from 80px down to the very bottom. */
      trigger: document.body,
      start: "top -80",
      end: "bottom top",
      toggleClass: { targets: nav, className: "is-scrolled" },
    });
  }

  /* Everything above was made inside the matchMedia context, which reverts it.
     Lenis is not GSAP's to clean up. */
  return stopLenis;
}

/* The fonts decide where every line breaks, so the split waits for them. */
document.fonts.ready.then(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", setup);
});
