const desktop = matchMedia('(min-width: 48rem)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

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

  #collapsedHeight() {
    const listTop = this.#list.getBoundingClientRect().top;
    return this.#items[this.#visibleCount - 1].getBoundingClientRect().bottom - listTop;
  }

  #setExpanded(expanded) {
    this.#expanded = expanded;
    this.#button.setAttribute('aria-expanded', String(expanded));
    this.#button.textContent = expanded ? this.#labels.less : this.#labels.more;
    this.#hiddenItems.forEach((item) => (item.inert = !expanded));
  }

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
    if (this.#hiddenItems.some((item) => item.contains(document.activeElement))) this.#button.focus();

    this.#container.style.height = `${this.#container.offsetHeight}px`;
    void this.#container.offsetHeight;
    this.#setExpanded(false);
    this.#container.style.height = `${this.#collapsedHeight()}px`;
  }

  #onTransitionEnd(event) {
    if (event.target === this.#container && event.propertyName === 'height' && this.#expanded) {
      this.#container.style.height = '';
    }
  }
}
