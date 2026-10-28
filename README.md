# Platter Dev Challenge — Best Sellers

A "Best Sellers" product section built with **semantic HTML**, **Tailwind CSS v4** and **vanilla JavaScript**, recreated from the Figma design (desktop carousel and mobile grid).

- **Live preview:** https://grossoluis.github.io/platter-challenge/
- **Repository:** https://github.com/GrossoLuis/platter-challenge

No build step is needed to review it: the compiled CSS is committed and the page is plain static HTML.

## Requirements checklist

- [x] 10 product cards
- [x] Mobile: only the first 4 are visible; **Show More** reveals the other 6 with a smooth height animation (and toggles back to **Show Less**)
- [x] Hovering a product image swaps it for a secondary image
- [x] Unsplash placeholder images
- [x] HTML + vanilla JS + Tailwind CSS, fully responsive
- [x] Custom scrollbar whose thumb grows to **6px** on hover and touch
- [x] Show More is mobile only

## Tech stack

- **HTML5**: one semantic document, no templating.
- **Tailwind CSS v4**: compiled with the official CLI, minified and committed (`assets/css/styles.css`). Design tokens live in `@theme` in `src/input.css`.
- **Vanilla JS**: ES modules and a custom element, no dependencies.

## Key decisions

**Tailwind is precompiled, not loaded from the CDN.** The Play CDN is meant for prototyping: it compiles in the browser on every visit. Compiling with the CLI ships only the classes the page uses (~15 KB minified). Automatic source detection is turned off (`source(none)`) so only `index.html` and the JS are scanned.

**Design values come from Figma, as tokens.** Colors, font sizes, letter spacing and the two fluid sizes (`--spacing-gutter`, `--spacing-card`) are defined once in `@theme`, so the markup uses names like `px-gutter`, `w-card` or `text-heading-lg` instead of repeated arbitrary values. The fluid gutter and card width reproduce the 1920px frame exactly (128px gutter, 355px cards) and scale down smoothly so tablet and laptop widths keep the same proportion.

**One list, two layouts.** There is a single `<ul>` with 10 `<li>`. Below `md` (768px) it is a two-column grid; from `md` up it is a horizontal scroller with scroll snapping that bleeds to the right edge of the viewport. Nothing is duplicated between mobile and desktop, and products are written in HTML (not rendered by JS), so they are indexable and work without JavaScript.

**Custom scrollbar in JS instead of `::-webkit-scrollbar`.** Pseudo-element scrollbars don't work in Firefox, can't animate their size, and don't respond to touch. The native scrollbar is hidden and a track and thumb are drawn and kept in sync with the scroll position:
- the thumb is proportional to the visible area and moves with `transform`, updated once per frame;
- it can be dragged with Pointer Events (one code path for mouse, pen and touch), and clicking the track scrolls there smoothly;
- it grows to 6px on hover (CSS) and while pressed (a `data-active` attribute, which covers touch);
- scroll snapping is paused while dragging, otherwise mandatory snapping pulls the scroller back on every move;
- it hides itself, and the scroller leaves the tab order, when there is nothing to scroll.

**Show More.** The scroller collapses to the bottom edge of the 4th card (measured, not hardcoded), so it adapts to any width. Expanding animates to the full height and then releases it to `auto` so later resizes don't break the layout. Hidden cards are `inert`, so they can't be focused and are skipped by screen readers. If focus is inside a card when the list collapses, it moves to the button. The button starts `hidden` in the HTML, so without JS every product is simply visible.

**Accessibility.**
- Landmarks and a heading structure: `<main>`, a section labelled by its `<h2>`, and an `<article>` with an `<h3>` per product.
- One link per card, wrapping the image and the title.
- The desktop scroller is a labelled, keyboard-scrollable region, and focus styles are visible.
- Ratings are announced as text ("Rated 4.5 out of 5 stars"); the star icons are decorative.
- The custom scrollbar is `aria-hidden`, because the region itself is already keyboard accessible.
- `prefers-reduced-motion` disables every transition.

**Performance.**
- Every image has `width` and `height` set, so it reserves its space (no layout shift).
- Unsplash's CDN serves square, auto-format crops via `srcset` and `sizes`.
- Only the first four images load eagerly, and only the first has `fetchpriority="high"`.
- Fonts are preconnected and use `font-display: swap`.

**A reusable custom element.** `<best-sellers-carousel>` sets everything up in `connectedCallback` and removes every listener and observer through a single `AbortController` in `disconnectedCallback`. The same files work unchanged in a Shopify theme, where the theme editor re-renders sections. Texts and the number of visible products come from `data-*` attributes, ready to be mapped to section settings.

## Process

1. Extracted the design from Figma (both frames) with the Figma MCP: typography, colors, spacing, radii, badges and scrollbar.
2. Set up the Tailwind CLI and turned the Figma values into theme tokens.
3. Wrote the semantic markup with one card, then all ten products with verified Unsplash images.
4. Built the custom scrollbar, Show More and the custom element as small single-purpose modules.
5. QA in a real Chrome instance driven over the DevTools Protocol, covering:
   - collapse and expand;
   - `inert` and focus handling;
   - thumb drag, track click and keyboard scrolling;
   - the hover swap;
   - crossing the breakpoint in both directions.

   This found and fixed a real bug: visually hidden rating text inside off-screen cards made the whole page scroll horizontally.

The commit history follows these steps one change at a time.

### Notes on the design

- The two frames differ slightly: the first product shows 4.5 stars on desktop and 5 on mobile, and the "Save 15%" badge sits on different cards. Desktop was treated as the source of truth.
- Product titles are kept exactly as in Figma, including the repeated one. Image `alt` texts describe what each photo shows.
- Products 6–10 aren't in the design and were added in the same style.

## Project structure

```
├── index.html                    # The page
├── src/input.css                 # Tailwind entry: theme tokens, badge component, scrollbar utility
├── assets/
│   ├── css/styles.css            # Compiled + minified CSS (committed)
│   └── js/
│       ├── best-sellers-carousel.js  # Custom element, composes the two modules below
│       ├── custom-scrollbar.js       # CustomScrollbar
│       └── show-more.js              # ShowMore
```

## Run locally (optional)

```bash
npm install
npm run dev     # rebuild CSS on change
npm run serve   # serve the folder (ES modules need http://, not file://)
```

`npm run build` produces the minified CSS that is committed.

## Testing

- Chrome (desktop and mobile emulation) at 320, 375, 390, 768, 1024, 1440 and 1920px.
- No console errors, and no horizontal page overflow at any width.
- All 20 image URLs return `200`.

## Image credits

All photos are free images from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license):

| Product | Primary | Secondary |
| --- | --- | --- |
| 1 | [Headphones](https://unsplash.com/photos/PDX_a_82obo) | [Headphones](https://unsplash.com/photos/PvIz8BmuwDw) |
| 2 | [Sunglasses](https://unsplash.com/photos/DQcu4QOdj5c) | [Sunglasses](https://unsplash.com/photos/w1ELNajqfwk) |
| 3 | [Sneaker](https://unsplash.com/photos/164_6wVEHfI) | [Sneaker](https://unsplash.com/photos/YxFXHNNVDko) |
| 4 | [Banana](https://unsplash.com/photos/sf_1ZDA1YFw) | [Banana](https://unsplash.com/photos/aDSz2X7Nl28) |
| 5 | [Scale model car](https://unsplash.com/photos/UQ7__wQb6DM) | [Toy car](https://unsplash.com/photos/8ZzPZpclN18) |
| 6 | [Sneakers](https://unsplash.com/photos/6Uz8LaZPZsE) | [Sneakers](https://unsplash.com/photos/BWPqHZBhMVA) |
| 7 | [Film camera](https://unsplash.com/photos/brAkTCdnhW8) | [Camera](https://unsplash.com/photos/IEIepiPqhvA) |
| 8 | [Perfume](https://unsplash.com/photos/bUjiFIn3PLk) | [Perfume](https://unsplash.com/photos/zvqq7CG8BwY) |
| 9 | [Earbuds](https://unsplash.com/photos/VQ1F3zxx6o0) | [Earbuds](https://unsplash.com/photos/Kf2kr_BhaTk) |
| 10 | [Caps](https://unsplash.com/photos/WqP0fj5_T6U) | Same photo, zoomed crop |
