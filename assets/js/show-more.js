const desktop = matchMedia('(min-width: 48rem)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Mobile-only "Show More": collapses a list to its first N items and reveals the rest
 * with a height transition. Without JS every item stays visible (the button is `hidden`).
 */
export class ShowMore {
  #container;
  #list;
  #button;
  #items;
  #visibleCount;
  #labels;
  #expanded = false;

  constructor(container, button, { visibleCount, labels, signal }) {
    this.#container = container;
    this.#list = container.querySelector('ul');
    this.#button = button;
    this.#items = [...this.#list.children];
    this.#visibleCount = visibleCount;
    this.#labels = labels;

    if (this.#items.length <= visibleCount) return;

    button.hidden = false;
    button.addEventListener('click', () => this.#toggle(), { signal });
    desktop.addEventListener('change', () => this.#reset(), { signal });
    container.addEventListener('transitionend', (event) => this.#onTransitionEnd(event), { signal });

    // Card heights change with the viewport width (and when fonts load), so keep the collapsed height in sync.
    const resizeObserver = new ResizeObserver(() => {
      if (!this.#expanded && !desktop.matches) this.#container.style.height = `${this.#collapsedHeight()}px`;
    });
    resizeObserver.observe(this.#list);
    signal.addEventListener('abort', () => resizeObserver.disconnect());

    this.#reset();
  }

  get #hiddenItems() {
    return this.#items.slice(this.#visibleCount);
  }

  /** Distance from the top of the list to the bottom of the last visible item. */
  #collapsedHeight() {
    const listTop = this.#list.getBoundingClientRect().top;
    return this.#items[this.#visibleCount - 1].getBoundingClientRect().bottom - listTop;
  }

  #setExpanded(expanded) {
    this.#expanded = expanded;
    this.#button.setAttribute('aria-expanded', String(expanded));
    this.#button.textContent = expanded ? this.#labels.less : this.#labels.more;
    // Collapsed items are clipped, so take them out of the tab order and the accessibility tree.
    this.#hiddenItems.forEach((item) => (item.inert = !expanded));
  }

  /** Applies the initial state for the current breakpoint. */
  #reset() {
    if (desktop.matches) {
      this.#container.style.height = '';
      this.#hiddenItems.forEach((item) => (item.inert = false));
      return;
    }
    this.#setExpanded(false);
    this.#container.style.height = `${this.#collapsedHeight()}px`;
  }

  #toggle() {
    if (this.#expanded) {
      this.#collapse();
    } else {
      this.#expand();
    }
  }

  #expand() {
    this.#setExpanded(true);
    this.#container.style.height = `${this.#list.scrollHeight}px`;
    if (reducedMotion.matches) this.#container.style.height = '';
  }

  #collapse() {
    // Keep focus on the button instead of losing it inside an item that is about to become inert.
    if (this.#hiddenItems.some((item) => item.contains(document.activeElement))) this.#button.focus();

    // Transition from the current pixel height: `auto` can't be animated.
    this.#container.style.height = `${this.#container.offsetHeight}px`;
    this.#container.offsetHeight; // Force a reflow so the browser registers the start value.
    this.#setExpanded(false);
    this.#container.style.height = `${this.#collapsedHeight()}px`;
  }

  #onTransitionEnd(event) {
    // Once expanded, release the fixed height so the list can resize freely.
    if (event.target === this.#container && event.propertyName === 'height' && this.#expanded) {
      this.#container.style.height = '';
    }
  }
}
