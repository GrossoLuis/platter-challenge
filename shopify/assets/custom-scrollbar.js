const MIN_THUMB_WIDTH = 40;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export class CustomScrollbar {
  #scroller;
  #bar;
  #thumb;
  #thumbWidth = 0;
  #frame = 0;
  #dragOffset = null;

  constructor(scroller, bar, { signal }) {
    this.#scroller = scroller;
    this.#bar = bar;
    this.#thumb = bar.querySelector('[data-scrollbar-thumb]');

    scroller.addEventListener('scroll', () => this.#scheduleUpdate(), { passive: true, signal });
    bar.addEventListener('pointerdown', (event) => this.#onPointerDown(event), { signal });
    bar.addEventListener('pointermove', (event) => this.#onPointerMove(event), { signal });
    bar.addEventListener('pointerup', () => this.#onPointerEnd(), { signal });
    bar.addEventListener('pointercancel', () => this.#onPointerEnd(), { signal });

    const resizeObserver = new ResizeObserver(() => this.#scheduleUpdate());
    resizeObserver.observe(scroller);
    signal.addEventListener('abort', () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(this.#frame);
    });

    this.#update();
  }

  get #maxScroll() {
    return this.#scroller.scrollWidth - this.#scroller.clientWidth;
  }

  get #maxThumbOffset() {
    return this.#bar.clientWidth - this.#thumbWidth;
  }

  #scheduleUpdate() {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#update());
  }

  #update() {
    const { scrollWidth, clientWidth, scrollLeft } = this.#scroller;
    const hasOverflow = this.#maxScroll > 1;

    this.#bar.hidden = !hasOverflow;
    this.#scroller.tabIndex = hasOverflow ? 0 : -1;
    if (!hasOverflow) return;

    this.#thumbWidth = Math.max(MIN_THUMB_WIDTH, (clientWidth / scrollWidth) * this.#bar.clientWidth);
    const offset = (scrollLeft / this.#maxScroll) * this.#maxThumbOffset;

    this.#thumb.style.width = `${this.#thumbWidth}px`;
    this.#thumb.style.transform = `translateX(${offset}px)`;
  }

  #scrollToThumbOffset(offset, behavior = 'instant') {
    const clamped = Math.min(Math.max(offset, 0), this.#maxThumbOffset);
    this.#scroller.scrollTo({ left: (clamped / this.#maxThumbOffset) * this.#maxScroll, behavior });
  }

  #onPointerDown(event) {
    if (event.button !== 0) return;

    const barLeft = this.#bar.getBoundingClientRect().left;
    const thumbRect = this.#thumb.getBoundingClientRect();
    const isOnThumb = event.clientX >= thumbRect.left && event.clientX <= thumbRect.right;

    this.#bar.setPointerCapture(event.pointerId);
    this.#thumb.toggleAttribute('data-active', true);

    if (isOnThumb) {
      this.#dragOffset = event.clientX - thumbRect.left;
      this.#scroller.style.scrollSnapType = 'none';
    } else {
      const behavior = reducedMotion.matches ? 'instant' : 'smooth';
      this.#scrollToThumbOffset(event.clientX - barLeft - this.#thumbWidth / 2, behavior);
    }
  }

  #onPointerMove(event) {
    if (this.#dragOffset === null) return;
    const barLeft = this.#bar.getBoundingClientRect().left;
    this.#scrollToThumbOffset(event.clientX - barLeft - this.#dragOffset);
  }

  #onPointerEnd() {
    this.#dragOffset = null;
    this.#scroller.style.scrollSnapType = '';
    this.#thumb.removeAttribute('data-active');
  }
}
