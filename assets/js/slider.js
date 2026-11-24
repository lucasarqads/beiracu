/* ==========================================================
   SLIDER DO HERO
   - Transição em fade (controlada pelo CSS via .is-active)
   - Autoplay a cada 6s, pausa no hover e com foco dentro do slider
   - Setas, dots, teclado (← →) e swipe no touch
   ========================================================== */

'use strict';

const Slider = (() => {
  const AUTOPLAY_DELAY = 6000;
  const SWIPE_THRESHOLD = 50;

  function init(root) {
    if (!root) return;

    const slides = Array.from(root.querySelectorAll('.hero__slide'));
    const prevBtn = root.querySelector('.hero__arrow--prev');
    const nextBtn = root.querySelector('.hero__arrow--next');
    const dotsWrap = root.querySelector('.hero__dots');
    const track = root.querySelector('.hero__track');

    if (slides.length === 0) return;

    // Quem prefere menos movimento não recebe autoplay
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let timer = null;
    let isHovered = false;
    let hasFocus = false;

    /* ---------- Dots ---------- */
    const dots = slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero__dot';
      dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
      dot.addEventListener('click', () => {
        goTo(index);
        restart();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    /* ---------- Troca de slide ---------- */
    function goTo(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        // Slides inativos não recebem foco (o botão deles some do Tab)
        slide.inert = !active;
      });

      dots.forEach((dot, i) => {
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    }

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    /* ---------- Autoplay ---------- */
    function start() {
      if (reduceMotion || timer || isHovered || hasFocus) return;
      timer = window.setInterval(next, AUTOPLAY_DELAY);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    function restart() {
      stop();
      start();
    }

    /* ---------- Eventos ---------- */
    nextBtn?.addEventListener('click', () => { next(); restart(); });
    prevBtn?.addEventListener('click', () => { prev(); restart(); });

    // Pausa no hover
    root.addEventListener('mouseenter', () => { isHovered = true; stop(); });
    root.addEventListener('mouseleave', () => { isHovered = false; start(); });

    // Pausa enquanto o foco do teclado estiver dentro do slider
    root.addEventListener('focusin', () => { hasFocus = true; stop(); });
    root.addEventListener('focusout', (event) => {
      if (!root.contains(event.relatedTarget)) {
        hasFocus = false;
        start();
      }
    });

    // Teclado: setas esquerda/direita com o foco no slider
    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    });

    // Swipe no touch
    let touchStartX = 0;
    let touchStartY = 0;

    track.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      stop();
    }, { passive: true });

    track.addEventListener('touchend', (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;

      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaX < 0 ? next() : prev();
      }
      start();
    }, { passive: true });

    // Não troca slides com a aba em segundo plano
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    /* ---------- Início ---------- */
    goTo(current);
    start();
  }

  return { init };
})();
