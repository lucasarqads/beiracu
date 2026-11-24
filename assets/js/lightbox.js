/* ==========================================================
   LIGHTBOX — imagem ampliada do produto
   Usa o <dialog> nativo (foco preso e Esc já inclusos).
   - Navega entre as fotos do produto (setas, teclado ← →, swipe)
   - Fecha no X, no Esc ou clicando fora da imagem
   ========================================================== */

'use strict';

const Lightbox = (() => {
  const SWIPE_THRESHOLD = 50;

  let els = {};
  let images = [];
  let index = 0;
  let productName = '';
  let opener = null;

  function show(newIndex) {
    index = (newIndex + images.length) % images.length;
    const multiple = images.length > 1;

    els.image.classList.add('is-loading');
    // Placeholder automático caso o arquivo não exista (ver main.js)
    els.image.dataset.fallbackName = productName;
    els.image.src = images[index];
    if (els.image.complete && els.image.naturalWidth > 0) {
      els.image.classList.remove('is-loading'); // já estava em cache
    }
    els.image.alt = multiple
      ? `${productName} — foto ${index + 1} de ${images.length}`
      : productName;

    els.counter.textContent = multiple ? `${index + 1} / ${images.length}` : '';
    els.prev.hidden = !multiple;
    els.next.hidden = !multiple;
  }

  /**
   * Abre o lightbox com as fotos de um produto.
   * @param {object} product  item de PRODUCTS
   * @param {number} startIndex  foto inicial
   * @param {HTMLElement} trigger  elemento que recebe o foco ao fechar
   * @param {string|null} colorId  cor escolhida no card (produtos com cores)
   */
  function open(product, startIndex = 0, trigger = null, colorId = null) {
    if (!els.dialog || !product) return;

    const color = getProductColor(product, colorId);
    images = getProductImages(product, colorId);
    productName = color ? `${product.nome} — ${color.nome}` : product.nome;
    opener = trigger;

    els.title.textContent = productName;
    show(startIndex);

    els.dialog.showModal();
    document.body.classList.add('is-locked');
    els.close.focus();
  }

  function close() {
    els.dialog?.close();
  }

  function init() {
    const dialog = document.querySelector('.lightbox');
    // Navegadores sem <dialog>: o clique na imagem simplesmente não faz nada
    if (!dialog || typeof dialog.showModal !== 'function') return;

    els = {
      dialog,
      image: dialog.querySelector('.lightbox__image'),
      title: dialog.querySelector('.lightbox__title'),
      counter: dialog.querySelector('.lightbox__counter'),
      close: dialog.querySelector('.lightbox__close'),
      prev: dialog.querySelector('.lightbox__arrow--prev'),
      next: dialog.querySelector('.lightbox__arrow--next'),
    };

    els.close.addEventListener('click', close);
    els.prev.addEventListener('click', () => show(index - 1));
    els.next.addEventListener('click', () => show(index + 1));

    // Fade ao trocar de foto
    els.image.addEventListener('load', () => els.image.classList.remove('is-loading'));

    // Teclado
    dialog.addEventListener('keydown', (event) => {
      if (images.length < 2) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    });

    // Clique fora da imagem (no fundo) fecha
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.classList.contains('lightbox__figure')) {
        close();
      }
    });

    // Swipe no touch
    let touchStartX = 0;
    dialog.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    dialog.addEventListener('touchend', (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (images.length > 1 && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        show(deltaX < 0 ? index + 1 : index - 1);
      }
    }, { passive: true });

    // Ao fechar (X, Esc ou fundo): libera o scroll e devolve o foco
    dialog.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
      opener?.focus();
      opener = null;
    });
  }

  return { init, open, close };
})();
