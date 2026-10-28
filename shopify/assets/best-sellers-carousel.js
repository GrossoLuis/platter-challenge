import { CustomScrollbar } from './custom-scrollbar.js';
import { ShowMore } from './show-more.js';

class BestSellersCarousel extends HTMLElement {
  #controller = null;

  connectedCallback() {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    const scroller = this.querySelector('[data-scroller]');
    const scrollbar = this.querySelector('[data-scrollbar]');
    const button = this.querySelector('[data-show-more]');
    if (!scroller) return;

    if (scrollbar) new CustomScrollbar(scroller, scrollbar, { signal });

    if (button) {
      new ShowMore(scroller, button, {
        visibleCount: Number(this.dataset.mobileVisible) || 4,
        labels: {
          more: this.dataset.labelMore ?? 'Show More',
          less: this.dataset.labelLess ?? 'Show Less',
        },
        signal,
      });
    }
  }

  disconnectedCallback() {
    this.#controller?.abort();
  }
}

if (!customElements.get('best-sellers-carousel')) {
  customElements.define('best-sellers-carousel', BestSellersCarousel);
}
