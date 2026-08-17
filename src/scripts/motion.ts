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
 * - `data-next-up` — a section that pins while what comes next opens out of
 *   the middle of the screen, tracks how far through it the visitor is, and
 *   hands over to the page named in the attribute once they reach the end.
 *   Links inside it take the same fade rather than a hard load.
 * - `data-toc` — a list of links to headings on the page. The entry being read
 *   is marked as the reader passes through it, whatever their motion setting
 *   says; following one is carried by the scroll rather than cut to, for the
 *   visitors who have that scroll.
 *
 * None of the rest runs for a visitor who prefers reduced motion. The rules
 * that hold elements back sit behind the same query, so that page is static
 * rather than blank.
 *
 * This is also where behaviour goes for anything drawn inside a `Section`: a
 * section renders its slot once to find out whether it holds anything, and a
 * component's own `<script>` is emitted on that first pass and lost with it.
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

/** How far under the bar a heading with no scroll margin counts as reached. */
const CONTENTS_LINE = 24;

/** How long the veil takes to cover the page. Matches src/styles/motion.css. */
const VEIL_SECONDS = 0.45;
/** Tells the next page it was arrived at behind the veil. Read in BaseLayout. */
const VEIL_KEY = "veiled";

/**
 * Hands the scroll to Lenis and keeps ScrollTrigger reading from it.
 * Returns the instance and the teardown.
 */
function startLenis() {
  /* In-page links are left to the browser. Lenis follows a native jump
     perfectly well, and the skip link should land instantly. Contents entries
     are the one exception, and ask for the scroll themselves. */
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

  return {
    lenis,
    stop: () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    },
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

/**
 * The pinned close of a page: the next one opens out of the middle of the
 * screen as the section is scrolled through, and reaching the end of it opens
 * that page. `leave` fades out and follows a link.
 *
 * The masked starting state, and the numbers in it, are in the page's own
 * stylesheet — set before the first paint, and read back out of the computed
 * style here, so the shape of the reveal stays a design decision.
 */
function nextUp(section: HTMLElement, leave: (href: string) => void) {
  const href = section.dataset.nextUp;
  const pin = section.querySelector<HTMLElement>("[data-next-pin]");
  const frame = section.querySelector<HTMLElement>("[data-next-frame]");
  const image = section.querySelector<HTMLElement>("[data-next-image]");
  const content = section.querySelector<HTMLElement>("[data-next-content]");
  const bar = section.querySelector<HTMLElement>("[data-next-bar]");
  const count = section.querySelector<HTMLElement>("[data-next-count]");
  const hint = section.querySelector<HTMLElement>("[data-next-hint]");

  if (!href || !pin || !frame || !image || !content) return;

  /* Written every frame the section is scrolled, so neither goes through the
     tween machinery. */
  const setBar = bar ? gsap.quickSetter(bar, "scaleX") : null;
  let shown = -1;

  /* Two things have to be true before the page may advance on its own: the
     visitor has scrolled since the page loaded, and they have been somewhere
     other than the very end of this section. Between them they rule out the
     one way this could run away with itself — coming back to the page, having
     the scroll position restored at the end of the section, and being sent
     straight back off it. */
  let scrolled = false;
  let started = false;

  const advance = () => {
    if (!scrolled || !started) return;
    if (hint) hint.textContent = "Opening";
    /* `leave` is the one that only happens once. */
    leave(href);
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      /* A screen and a half: long enough for the reveal to be a move the
         visitor makes rather than one that happens to them. */
      end: "+=150%",
      pin,
      anticipatePin: 1,
      scrub: true,
      onUpdate: (self) => {
        setBar?.(self.progress);

        if (count) {
          const percent = Math.round(self.progress * 100);
          if (percent !== shown) {
            shown = percent;
            count.textContent = String(percent);
          }
        }

        if (self.progress < 0.9) started = true;
        /* Short of the end rather than past it, so the pin is still holding
           the picture still as the veil comes up — and short by enough that a
           scroller which stops a pixel or two shy of the bottom still gets
           there, since nothing follows this section to scroll into. */
        if (self.progress > 0.985 && self.direction === 1) advance();
      },
      /* Backstop, for a jump that skips the frame the line above wanted. */
      onLeave: advance,
    },
  });

  tl
    /* The mask opens first, against an oversized picture settling back to its
       own size — the frame grows into the image rather than the image into the
       frame. */
    .to(
      frame,
      {
        "--reveal-inline": "0%",
        "--reveal-block": "0%",
        "--reveal-radius": "0rem",
        duration: 0.72,
      },
      0,
    )
    .fromTo(image, { scale: 1.35 }, { scale: 1, duration: 0.72 }, 0)
    /* The name arrives once there is room for it. */
    .fromTo(
      content,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.6,
    )
    /* The last stretch is a held frame, so the project is seen whole before
       the page turns — with a push in at the end, into the transition. */
    .to(image, { scale: 1.06, duration: 0.1 }, 0.9);

  /* Clicking through takes the same fade the end of the scroll does. */
  section.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    const link = (event.target as Element | null)?.closest?.("a[href]") as
      HTMLAnchorElement | null | undefined;
    /* Anything leaving the site, or opening elsewhere, is the browser's. */
    if (!link || link.target || link.origin !== location.origin) return;

    event.preventDefault();
    leave(link.href);
  });

  /* Not before the scroll position has been restored and settled, which is
     itself a scroll event. */
  gsap.delayedCall(0.8, () => {
    addEventListener(
      "scroll",
      () => {
        scrolled = true;
      },
      { once: true, passive: true },
    );
  });
}

/**
 * Marks the entry in a contents list whose section is being read. The headings
 * are measured rather than observed: with the bar stuck over the top of the
 * page, what counts is which heading was last passed under it, and that is one
 * comparison each on the frames the page actually moves.
 */
function contents(list: HTMLElement) {
  const bar = document.querySelector<HTMLElement>("[data-nav]");

  const entries = [...list.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
    .map((link) => ({
      link,
      heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter(
      (entry): entry is { link: HTMLAnchorElement; heading: HTMLElement } =>
        !!entry.heading,
    );

  if (!entries.length) return;

  let active: HTMLAnchorElement | null = null;
  let frame = 0;

  const update = () => {
    frame = 0;
    /* A heading counts as reached where following its own link would put it:
       its scroll margin, which is already set to clear the bar. Read each time
       rather than once, since it is a fluid value. A heading with none of its
       own is measured against the bar itself. */
    const margin = parseFloat(
      getComputedStyle(entries[0].heading).scrollMarginTop,
    );
    const line =
      margin || (bar?.getBoundingClientRect().height ?? 0) + CONTENTS_LINE;

    /* Nothing is marked until the first heading has been passed, so the list
       stays quiet while the standfirst is still being read. */
    let current: HTMLAnchorElement | null = null;
    for (const { link, heading } of entries) {
      /* A pixel of give: a heading jumped to lands a fraction of one either
         side of its margin, and without this it is a coin toss whether the
         entry just followed is the one that ends up marked. */
      if (heading.getBoundingClientRect().top - line > 1) break;
      current = link;
    }

    if (current === active) return;
    active?.removeAttribute("aria-current");
    current?.setAttribute("aria-current", "location");
    active = current;
  };

  const queue = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  update();
}

/**
 * Carries the page to a contents entry instead of cutting to it. Following one
 * is a move through the piece being read rather than an arrival somewhere new,
 * so it is worth watching happen — the skip link and every other in-page link
 * stay instant. So does this, for a visitor who prefers reduced motion: the
 * scroll doing the carrying is only started for the ones who don't.
 */
function contentsScroll(lenis: Lenis, list: HTMLElement) {
  list.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;

    const link = (event.target as Element | null)?.closest?.('a[href^="#"]') as
      HTMLAnchorElement | null | undefined;
    if (!link) return;

    const heading = document.getElementById(
      decodeURIComponent(link.hash.slice(1)),
    );
    if (!heading) return;

    event.preventDefault();

    /* No offset: Lenis reads the heading's own scroll margin, so it comes to
       rest exactly where the jump this replaces would have put it — which is
       also the line the entry above marks itself against. */
    lenis.scrollTo(heading);

    /* Both things the jump this replaces would have done: name the section in
       the address bar, and put the reader inside it rather than back where
       they were reading. The scroll is Lenis's, so focus mustn't move it. */
    history.pushState(null, "", link.hash);
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  });
}

function setup() {
  const { lenis, stop: stopLenis } = startLenis();

  for (const list of document.querySelectorAll<HTMLElement>("[data-toc]")) {
    contentsScroll(lenis, list);
  }

  /**
   * Covers the page and follows a link once it is covered, leaving a note for
   * the page arriving to fade the veil back off. The scroll stops first: the
   * frame the visitor is looking at should be the last thing that moves.
   */
  let leaving = false;
  const leave = (href: string) => {
    if (leaving) return;
    leaving = true;
    lenis.stop();
    try {
      sessionStorage.setItem(VEIL_KEY, "1");
    } catch {
      /* Private mode. The handover is a cut instead of a fade. */
    }
    document.documentElement.classList.add("is-veiled");
    gsap.delayedCall(VEIL_SECONDS, () => {
      window.location.href = href;
    });
  };

  /* Coming back to a page the browser kept rather than reloaded, none of the
     inline script in BaseLayout runs again — so the page would come back the
     way it left: covered, and with its scroll stopped. Put it back on its
     feet, and let it hand over again. */
  addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    leaving = false;
    document.documentElement.classList.remove("is-veiled");
    lenis.start();
    ScrollTrigger.refresh();
  });

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

  /* Last, because it pins: the triggers above are all measured against a
     document this one is about to make taller. */
  for (const section of gsap.utils.toArray<HTMLElement>("[data-next-up]")) {
    nextUp(section, leave);
  }

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

/* Where the reader is in a piece is not an animation, so it is marked outside
   both gates below: no fonts to wait for, and no motion to prefer against. */
for (const list of document.querySelectorAll<HTMLElement>("[data-toc]")) {
  contents(list);
}

/* The fonts decide where every line breaks, so the split waits for them. */
document.fonts.ready.then(() => {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", setup);
});
