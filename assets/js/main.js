/* ==========================================================
   MAIN — ponto de entrada
   - Drawer genérico (menu mobile e mini-cart)
   - Header sticky, menu, dropdowns
   - Renderização dos produtos, filtros e favoritos
   - Newsletter simulada
   ========================================================== */

'use strict';


/* ==========================================================
   DRAWER GENÉRICO
   Foco preso dentro do painel, Esc fecha, clique no overlay fecha,
   foco volta para o botão que abriu.
   ========================================================== */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
let activeDrawer = null;

function createDrawer({ panel, overlay, trigger, onClose }) {
  let isOpen = false;

  function getFocusable() {
    return Array.from(panel.querySelectorAll(FOCUSABLE))
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    // Prende o Tab dentro do drawer
    if (event.key === 'Tab') {
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function open() {
    if (isOpen) return;
    if (activeDrawer && activeDrawer !== api) activeDrawer.close({ returnFocus: false });

    isOpen = true;
    activeDrawer = api;
    panel.classList.add('is-open');
    overlay?.classList.add('is-visible');
    trigger?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', handleKeydown);

    // Foca o primeiro elemento do painel
    window.requestAnimationFrame(() => getFocusable()[0]?.focus());
  }

  function close({ returnFocus = true } = {}) {
    if (!isOpen) return;

    isOpen = false;
    if (activeDrawer === api) activeDrawer = null;
    panel.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    trigger?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    document.removeEventListener('keydown', handleKeydown);

    if (returnFocus) trigger?.focus();
    onClose?.();
  }

  overlay?.addEventListener('click', () => close());
  panel.querySelectorAll('[data-drawer-close]').forEach((btn) => {
    btn.addEventListener('click', () => close());
  });

  const api = { open, close, isOpen: () => isOpen };
  return api;
}


/* ==========================================================
   HEADER — sticky após 80px de rolagem
   ========================================================== */

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const SCROLL_LIMIT = 80;
  let ticking = false;

  const update = () => {
    header.classList.toggle('header--scrolled', window.scrollY > SCROLL_LIMIT);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}


/* ==========================================================
   MENU — drawer mobile + dropdowns
   ========================================================== */

function initNav() {
  const nav = document.getElementById('main-nav');
  const menuBtn = document.querySelector('.header__menu-btn');
  const overlay = document.querySelector('[data-overlay="nav"]');
  if (!nav || !menuBtn) return;

  const desktopQuery = window.matchMedia('(min-width: 992px)');
  const dropdownItems = Array.from(nav.querySelectorAll('.nav__item--has-dropdown'));

  /* ---------- Drawer mobile ---------- */
  const drawer = createDrawer({
    panel: nav,
    overlay,
    trigger: menuBtn,
    onClose: () => closeAllDropdowns(),
  });

  menuBtn.addEventListener('click', () => drawer.open());

  // Ao voltar para o desktop, fecha o drawer
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) drawer.close({ returnFocus: false });
    closeAllDropdowns();
  });

  // Clicar em um link do drawer fecha o menu
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && drawer.isOpen()) {
      drawer.close({ returnFocus: false });
    }
  });

  /* ---------- Dropdowns ---------- */
  function setExpanded(item, expanded) {
    item.classList.toggle('is-expanded', expanded);
    item.querySelector('.nav__toggle').setAttribute('aria-expanded', String(expanded));
  }

  function closeAllDropdowns(except) {
    dropdownItems.forEach((item) => {
      if (item !== except) setExpanded(item, false);
    });
  }

  dropdownItems.forEach((item) => {
    const toggle = item.querySelector('.nav__toggle');
    const links = () => Array.from(item.querySelectorAll('.nav__dropdown-link'));

    // Clique (desktop e mobile)
    toggle.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-expanded');
      closeAllDropdowns(item);
      setExpanded(item, willOpen);
    });

    // Teclado: ↓ abre e foca o primeiro link; ↑/↓ navegam; Esc fecha
    item.addEventListener('keydown', (event) => {
      const list = links();
      const index = list.indexOf(document.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setExpanded(item, true);
        list[(index + 1) % list.length]?.focus();
      } else if (event.key === 'ArrowUp' && index >= 0) {
        event.preventDefault();
        (index === 0 ? toggle : list[index - 1]).focus();
      } else if (event.key === 'Escape' && item.classList.contains('is-expanded')) {
        event.preventDefault();
        event.stopPropagation(); // não fecha o drawer junto
        setExpanded(item, false);
        toggle.focus();
      }
    });

    // Desktop: fecha ao sair com o mouse ou com o foco
    item.addEventListener('mouseleave', () => {
      if (desktopQuery.matches) setExpanded(item, false);
    });

    item.addEventListener('focusout', (event) => {
      if (desktopQuery.matches && !item.contains(event.relatedTarget)) {
        setExpanded(item, false);
      }
    });
  });

  // Clique fora fecha os dropdowns
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeAllDropdowns();
  });

  // Links do dropdown "Loja" aplicam o filtro do grid
  nav.querySelectorAll('[data-filter-link]').forEach((link) => {
    link.addEventListener('click', () => {
      setFilter(link.dataset.filterLink);
      closeAllDropdowns();
    });
  });
}


/* ==========================================================
   PRODUTOS — renderização, filtros e favoritos
   ========================================================== */

const FAVORITES_KEY = 'beiracu:favorites';
const favorites = new Set(storage.get(FAVORITES_KEY, []));
let currentFilter = 'todos';

/** Cor escolhida em cada card (mantida ao trocar de filtro): id do produto → id da cor */
const selectedColors = new Map();

/** Seletor de cores do card (só para produtos com "cores") */
function renderColorPicker(product, colorId) {
  if (!product.cores?.length) return '';
  const current = getProductColor(product, colorId);
  const name = escapeHTML(product.nome);

  const swatches = product.cores.map((cor) => `
    <button class="product-card__swatch" type="button" data-color="${cor.id}"
            style="--swatch: ${cor.hex}" aria-pressed="${cor.id === current.id}"
            aria-label="Cor ${escapeHTML(cor.nome)}" title="${escapeHTML(cor.nome)}"></button>
  `).join('');

  return `
    <div class="product-card__colors">
      <div class="product-card__swatches" role="group" aria-label="Cores de ${name}">${swatches}</div>
      <p class="product-card__color-name" aria-live="polite">${escapeHTML(current.nome)}</p>
    </div>
  `;
}

/** Tamanho escolhido em cada card: id do produto → tamanho */
const selectedSizes = new Map();

/** Seletor de tamanhos do card (só para produtos com "tamanhos") */
function renderSizePicker(product) {
  if (!product.tamanhos?.length) return '';
  const current = selectedSizes.get(product.id);

  const sizes = product.tamanhos.map((size) => `
    <button class="product-card__size" type="button" data-size="${escapeHTML(size)}"
            aria-pressed="${size === current}" aria-label="Tamanho ${escapeHTML(size)}">${escapeHTML(size)}</button>
  `).join('');

  return `
    <div class="product-card__sizes">
      <div class="product-card__size-list" role="group" aria-label="Tamanhos de ${escapeHTML(product.nome)}">${sizes}</div>
      <p class="product-card__size-error" role="alert"></p>
    </div>
  `;
}

function renderProductCard(product) {
  const name = escapeHTML(product.nome);
  const isFavorite = favorites.has(product.id);
  const colorId = getProductColor(product, selectedColors.get(product.id))?.id || '';

  const oldPrice = product.precoAntigo
    ? `<s class="product-card__price-old"><span class="visually-hidden">De </span>${formatPrice(product.precoAntigo)}</s>`
    : '';

  const currentLabel = product.precoAntigo ? '<span class="visually-hidden">Por </span>' : '';

  // TODO: trocar href="#" pelo link da página do produto
  return `
    <article class="product-card${product.preencherFoto ? ' product-card--cover' : ''}${product.aproximarModelo ? ' product-card--model' : ''}${product.fotosModelo ? ' product-card--model-mixed' : ''}" data-category="${product.categoria}" data-id="${product.id}" data-color="${colorId}"${product.inclinacao ? ` style="--tilt: ${Number(product.inclinacao)}deg"` : ''}>
      <div class="product-card__media">
        <!-- Carrossel de fotos do produto (gallery.js); clique na foto abre o lightbox -->
        ${Gallery.render(product, colorId)}
        <button class="product-card__wishlist ${isFavorite ? 'is-active' : ''}" type="button"
                data-id="${product.id}" aria-pressed="${isFavorite}"
                aria-label="Favoritar ${name}">
          <svg class="icon" aria-hidden="true"><use href="#icon-heart"></use></svg>
        </button>
      </div>

      <div class="product-card__info">
        <p class="product-card__collection">${escapeHTML(product.colecao)}</p>
        <h3 class="product-card__title"><a href="#">${name}</a></h3>
        <p class="product-card__price">
          <span class="product-card__price-current">${currentLabel}${formatPrice(product.preco)}</span>
          ${oldPrice}
        </p>
        ${renderColorPicker(product, colorId)}
        ${renderSizePicker(product)}
      </div>

      <button class="product-card__add" type="button" data-id="${product.id}"
              aria-label="Adicionar ${name} ao carrinho">
        Adicionar ao carrinho
      </button>
    </article>
  `;
}

function renderProducts(filter) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Filtros: 'todos', uma categoria (abas) ou 'colecao:<nome>' (menu Coleções)
  let list;
  if (filter === 'todos') {
    list = PRODUCTS;
  } else if (filter.startsWith('colecao:')) {
    const collection = filter.slice('colecao:'.length);
    list = PRODUCTS.filter((product) => product.colecao === collection);
  } else {
    list = PRODUCTS.filter((product) => product.categoria === filter);
  }

  grid.innerHTML = list.length
    ? list.map(renderProductCard).join('')
    : '<p class="products__empty">Nenhum produto nesta categoria por enquanto.</p>';

  const status = document.getElementById('products-status');
  if (status) {
    status.textContent = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
  }
}

/** Aplica um filtro com fade (também chamado pelos links do menu) */
function setFilter(filter) {
  const grid = document.getElementById('products-grid');
  const buttons = document.querySelectorAll('.filters__btn');

  buttons.forEach((btn) => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  if (filter === currentFilter || !grid) return;
  currentFilter = filter;

  grid.classList.add('is-fading');
  window.setTimeout(() => {
    renderProducts(filter);
    grid.classList.remove('is-fading');
  }, 300);
}

function toggleFavorite(button) {
  const id = Number(button.dataset.id);
  const product = getProductById(id);
  const isActive = !favorites.has(id);

  isActive ? favorites.add(id) : favorites.delete(id);
  storage.set(FAVORITES_KEY, Array.from(favorites));

  button.classList.toggle('is-active', isActive);
  button.setAttribute('aria-pressed', String(isActive));

  // Pequena animação
  button.classList.remove('is-pop');
  void button.offsetWidth;
  button.classList.add('is-pop');

  showToast(isActive
    ? `${product.nome} adicionado aos favoritos`
    : `${product.nome} removido dos favoritos`);
}

/** Marca o tamanho escolhido no card */
function selectSize(button) {
  const card = button.closest('.product-card');
  selectedSizes.set(Number(card.dataset.id), button.dataset.size);

  card.querySelectorAll('.product-card__size').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn === button));
  });
  card.querySelector('.product-card__size-error').textContent = '';
}

/** Adiciona ao carrinho na cor e no tamanho escolhidos (tamanho é obrigatório quando o produto tem tamanhos) */
function addFromCard(card) {
  const product = getProductById(card.dataset.id);
  const size = getProductSize(product, selectedSizes.get(product.id));

  if (product.tamanhos?.length && !size) {
    card.querySelector('.product-card__size-error').textContent = 'Escolha um tamanho';
    card.querySelector('.product-card__size').focus();
    return;
  }

  Cart.add(product.id, card.dataset.color || null, size);
}

/** Troca a cor do card: atualiza o seletor e "veste" a modelo com a nova cor */
function selectColor(swatch) {
  const card = swatch.closest('.product-card');
  const product = getProductById(card.dataset.id);
  const color = getProductColor(product, swatch.dataset.color);
  if (!color || card.dataset.color === color.id) return;

  card.dataset.color = color.id;
  selectedColors.set(product.id, color.id);

  card.querySelectorAll('.product-card__swatch').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn === swatch));
  });
  card.querySelector('.product-card__color-name').textContent = color.nome;

  Gallery.setColor(card.querySelector('.product-card__media'), product, color.id);
}

function initProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  Gallery.init(grid);
  renderProducts(currentFilter);

  // Abas de filtro
  document.querySelectorAll('.filters__btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Delegação: cor, adicionar ao carrinho, favoritar e ampliar imagem
  grid.addEventListener('click', (event) => {
    const swatch = event.target.closest('.product-card__swatch');
    if (swatch) {
      selectColor(swatch);
      return;
    }

    const addBtn = event.target.closest('.product-card__add');
    if (addBtn) {
      addFromCard(addBtn.closest('.product-card'));
      return;
    }

    const sizeBtn = event.target.closest('.product-card__size');
    if (sizeBtn) {
      selectSize(sizeBtn);
      return;
    }

    const zoomBtn = event.target.closest('.product-card__zoom');
    if (zoomBtn) {
      // Abre o lightbox na foto visível do card, na cor escolhida
      const card = zoomBtn.closest('.product-card');
      const product = getProductById(zoomBtn.dataset.id);
      Lightbox.open(product, Number(zoomBtn.dataset.index) || 0, zoomBtn, card.dataset.color || null);
      return;
    }

    const favBtn = event.target.closest('.product-card__wishlist');
    if (favBtn) toggleFavorite(favBtn);
  });
}


/* ==========================================================
   IMAGENS — placeholder automático quando o arquivo não existe
   TROCAR IMAGEM: basta colocar os arquivos nas pastas indicadas.
   ========================================================== */

function initImageFallback() {
  // "error" não borbulha: escutamos na fase de captura
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (img.tagName !== 'IMG' || !img.dataset.fallbackName) return;

    const name = img.dataset.fallbackName;
    img.removeAttribute('data-fallback-name'); // evita loop
    img.src = getPlaceholderImage(name);
  }, true);
}


/* ==========================================================
   NEWSLETTER — simulada (sem backend)
   ========================================================== */

function initNewsletter() {
  const form = document.querySelector('.newsletter');
  if (!form) return;

  const input = form.querySelector('.newsletter__input');
  const message = form.querySelector('.newsletter__message');
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const STORAGE_KEY = 'beiracu:newsletter';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = input.value.trim();

    if (!EMAIL_REGEX.test(email)) {
      message.textContent = 'Digite um e-mail válido.';
      message.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    // TODO: enviar para a plataforma de e-mail marketing
    const list = storage.get(STORAGE_KEY, []);
    if (!list.includes(email)) {
      list.push(email);
      storage.set(STORAGE_KEY, list);
    }

    message.textContent = 'Inscrição confirmada! Obrigado por assinar.';
    message.classList.remove('is-error');
    input.removeAttribute('aria-invalid');
    form.reset();
  });
}


/* ==========================================================
   INICIALIZAÇÃO
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initImageFallback();
  initHeader();
  initNav();
  initProducts();
  Cart.init();
  Slider.init(document.querySelector('.hero'));
  Lightbox.init();
  initNewsletter();
});
