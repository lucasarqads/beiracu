/* ==========================================================
   GALERIA DO CARD — carrossel de fotos dentro da imagem
   - Rolagem horizontal nativa com scroll-snap (swipe no touch)
   - Setas (aparecem no hover em dispositivos com mouse) e dots
   - Teclado: ← → com o foco na foto
   - Cada foto é um botão que abre o lightbox na foto atual
   Funciona por delegação: os cards podem ser re-renderizados à vontade.
   ========================================================== */

'use strict';

const Gallery = (() => {
  /* ---------- Marcação ---------- */

  /** Texto do placeholder (TROCAR IMAGEM): identifica qual foto falta */
  const placeholderLabel = (name, i) => (i === 0 ? name : `${name} — foto ${i + 1}`);

  /** HTML da área de imagem de um card (fotos + setas + dots) */
  function render(product, colorId) {
    const images = getProductImages(product, colorId);
    const name = escapeHTML(product.nome);
    const total = images.length;
    const multiple = total > 1;

    const slides = images.map((src, i) => {
      const label = multiple
        ? `Ampliar foto ${i + 1} de ${total} de ${name}`
        : `Ampliar imagem de ${name}`;
      const alt = i === 0 ? name : `${name} — foto ${i + 1}`;

      return `
        <button class="product-card__zoom${product.fotosModelo?.includes(i) ? ' product-card__zoom--model' : ''}" type="button" data-id="${product.id}" data-index="${i}"
                aria-label="${label}" ${i > 0 ? 'tabindex="-1"' : ''}>
          <!-- TROCAR IMAGEM: placeholder automático se o arquivo não existir -->
          <img class="product-card__image" src="${src}" alt="${alt}"
               width="600" height="600" loading="lazy" draggable="false" data-fallback-name="${escapeHTML(placeholderLabel(product.nome, i))}">
        </button>`;
    }).join('');

    if (!multiple) {
      return `<div class="product-card__slides" data-gallery>${slides}</div>`;
    }

    const dots = images
      .map((_, i) => `<span class="product-card__dot${i === 0 ? ' is-active' : ''}"></span>`)
      .join('');

    return `
      <div class="product-card__slides" data-gallery>${slides}</div>

      <button class="product-card__nav product-card__nav--prev" type="button" data-gallery-dir="-1"
              aria-label="Foto anterior de ${name}" disabled>
        <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-arrow-left"></use></svg>
      </button>
      <button class="product-card__nav product-card__nav--next" type="button" data-gallery-dir="1"
              aria-label="Próxima foto de ${name}">
        <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>
      </button>

      <div class="product-card__dots" aria-hidden="true">${dots}</div>
    `;
  }


  /* ---------- Estado ---------- */

  function getSlides(track) {
    return Array.from(track.querySelectorAll('.product-card__zoom'));
  }

  /** Índice da foto visível, a partir da posição de rolagem */
  function getIndex(track) {
    const width = track.clientWidth || 1;
    return Math.round(track.scrollLeft / width);
  }

  /** Atualiza dots, setas e ordem de foco conforme a foto visível */
  function update(track) {
    const media = track.parentElement;
    const slides = getSlides(track);
    const index = Math.min(slides.length - 1, Math.max(0, getIndex(track)));

    slides.forEach((slide, i) => {
      // Só a foto visível entra no Tab (evita várias paradas por card)
      slide.tabIndex = i === index ? 0 : -1;
    });

    media.querySelectorAll('.product-card__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
    });

    const prev = media.querySelector('[data-gallery-dir="-1"]');
    const next = media.querySelector('[data-gallery-dir="1"]');
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
  }

  /** Rola até uma foto */
  function goTo(track, index) {
    const slides = getSlides(track);
    const target = Math.min(slides.length - 1, Math.max(0, index));
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
    return slides[target];
  }

  /* ---------- Troca de cor com animação de "tingimento" ---------- */

  const DYE_FALLBACK_MS = 1600; // garante a finalização mesmo sem animationend

  /** Conclui na hora qualquer tingimento em andamento (troca de cor rápida) */
  function finishPendingDyes(media) {
    media.querySelectorAll('.product-card__image--dye').forEach((dye) => dye.finishDye?.());
  }

  /**
   * Troca as fotos do card para outra cor.
   * Cada foto nova entra por cima da antiga com uma máscara que desce
   * de cima para baixo — como o tecido sendo tingido. Como as fotos da
   * modelo só diferem no shorts, visualmente apenas a roupa muda.
   */
  function setColor(media, product, colorId) {
    const track = media.querySelector('[data-gallery]');
    const images = getProductImages(product, colorId);
    const name = product.nome;

    finishPendingDyes(media);

    // Volta para a capa (1ª foto) para a troca de cor ficar visível
    if (track && getIndex(track) !== 0) goTo(track, 0);

    media.querySelectorAll('.product-card__zoom').forEach((slide, i) => {
      const base = slide.querySelector('.product-card__image');
      const src = images[i];
      if (!base || !src || base.getAttribute('src') === src) return;

      const dye = new Image();
      dye.className = 'product-card__image product-card__image--dye';
      dye.alt = '';
      dye.setAttribute('aria-hidden', 'true');
      dye.draggable = false;
      dye.dataset.fallbackName = placeholderLabel(name, i);
      dye.src = src;

      let started = false;
      let finished = false;

      dye.finishDye = () => {
        if (finished) return;
        finished = true;
        // A foto de baixo passa a ser a nova cor (já está em cache por causa da camada)
        base.loading = 'eager';
        base.src = src;
        base.dataset.fallbackName = placeholderLabel(name, i);

        // Remove a camada só quando a foto de baixo estiver pronta (sem "piscar")
        let removed = false;
        const remove = () => { if (!removed) { removed = true; dye.remove(); } };
        if (base.complete) remove();
        base.addEventListener('load', remove, { once: true });
        base.addEventListener('error', remove, { once: true });
        window.setTimeout(remove, 600);
      };

      const start = () => {
        if (started || finished) return;
        started = true;
        slide.appendChild(dye);
        dye.classList.add('is-dyeing');
        dye.addEventListener('animationend', dye.finishDye, { once: true });
        window.setTimeout(dye.finishDye, DYE_FALLBACK_MS);
      };

      // Espera a foto nova carregar para a animação não começar "vazia"
      if (dye.complete) start();
      dye.addEventListener('load', start, { once: true });
      dye.addEventListener('error', start, { once: true });
      window.setTimeout(start, 1200); // conexão lenta: anima mesmo assim
    });
  }


  /* ---------- Eventos (delegados no grid) ---------- */

  function init(container) {
    if (!container) return;

    // "scroll" não borbulha, mas passa pela fase de captura
    const pending = new Set();
    container.addEventListener('scroll', (event) => {
      const track = event.target;
      if (!(track instanceof Element) || !track.matches('[data-gallery]') || pending.has(track)) return;

      pending.add(track);
      window.requestAnimationFrame(() => {
        update(track);
        pending.delete(track);
      });
    }, true);

    // Setas
    container.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-gallery-dir]');
      if (!btn) return;

      const track = btn.closest('.product-card__media').querySelector('[data-gallery]');
      goTo(track, getIndex(track) + Number(btn.dataset.galleryDir));
    });

    // Teclado: ← → com o foco em uma foto
    container.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const slide = event.target.closest('.product-card__zoom');
      if (!slide) return;

      const track = slide.closest('[data-gallery]');
      if (getSlides(track).length < 2) return;

      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const target = goTo(track, getIndex(track) + delta);
      target.tabIndex = 0;
      target.focus({ preventScroll: true });
    });
  }

  return { init, render, setColor };
})();
