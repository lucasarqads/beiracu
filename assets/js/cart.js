/* ==========================================================
   CARRINHO (simulado no frontend)
   - Estado em memória + localStorage
   - Badge com bounce, toast, mini-cart lateral
   - Checkout simulado (sem backend)
   ========================================================== */

'use strict';

/* ----------------------------------------------------------
   TOAST — mensagens rápidas no canto inferior direito
   ---------------------------------------------------------- */
const TOAST_DURATION = 3000;

function showToast(message) {
  const region = document.querySelector('.toast-region');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-bag"></use></svg>
    <span>${escapeHTML(message)}</span>
  `;
  region.appendChild(toast);

  // Remove após 3s, com animação de saída
  window.setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, TOAST_DURATION);
}


/* ----------------------------------------------------------
   CARRINHO
   ---------------------------------------------------------- */
const Cart = (() => {
  const STORAGE_KEY = 'beiracu:cart';

  /**
   * Itens: [{ id: number, cor: string|null, tam: string|null, qty: number }]
   * Cada combinação produto + cor + tamanho é uma linha separada na sacola.
   */
  let items = sanitize(storage.get(STORAGE_KEY, []));

  // Elementos (preenchidos no init)
  let els = {};
  let drawer = null;

  /** Chave única da linha (produto + cor + tamanho) */
  const keyOf = (item) => `${item.id}:${item.cor || ''}:${item.tam || ''}`;
  const findItem = (key) => items.find((item) => keyOf(item) === key);

  /** Garante que o que veio do localStorage é válido e ainda existe */
  function sanitize(data) {
    if (!Array.isArray(data)) return [];
    return data
      .filter((item) => item && getProductById(item.id) && Number(item.qty) > 0)
      .map((item) => {
        const product = getProductById(item.id);
        // Produto com cores: garante uma cor válida (itens antigos ganham a padrão)
        const cor = getProductColor(product, item.cor)?.id || null;
        const tam = getProductSize(product, item.tam);
        return { id: Number(item.id), cor, tam, qty: Math.min(99, Math.floor(item.qty)) };
      });
  }

  function save() {
    storage.set(STORAGE_KEY, items);
  }

  /* ---------- Cálculos ---------- */
  const getCount = () => items.reduce((total, item) => total + item.qty, 0);

  const getSubtotal = () => items.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? product.preco * item.qty : 0);
  }, 0);

  /* ---------- Ações ---------- */
  function add(id, colorId = null, size = null) {
    const product = getProductById(id);
    if (!product) return;

    const cor = getProductColor(product, colorId)?.id || null;
    const tam = getProductSize(product, size);
    const existing = findItem(keyOf({ id: product.id, cor, tam }));
    if (existing) {
      existing.qty = Math.min(99, existing.qty + 1);
    } else {
      items.push({ id: product.id, cor, tam, qty: 1 });
    }

    save();
    render();
    bumpBadge();
    showToast('Produto adicionado ao carrinho');
  }

  function changeQty(key, delta) {
    const item = findItem(key);
    if (!item) return;

    item.qty = Math.min(99, item.qty + delta);
    if (item.qty <= 0) {
      remove(key);
      return;
    }

    save();
    render();
  }

  function remove(key) {
    items = items.filter((item) => keyOf(item) !== key);
    save();
    render();
  }

  function clear() {
    items = [];
    save();
    render();
  }

  /** Checkout simulado: não há backend, apenas feedback visual */
  function checkout() {
    if (items.length === 0) return;

    const btn = els.checkout;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processando...';

    // TODO: integrar com um checkout real
    window.setTimeout(() => {
      const orderNumber = `BRC-${Math.floor(100000 + Math.random() * 900000)}`;
      btn.textContent = originalText;
      clear();
      drawer.close();
      showToast(`Pedido ${orderNumber} simulado com sucesso!`);
    }, 1200);
  }

  /* ---------- Renderização ---------- */
  function renderBadge() {
    const count = getCount();
    els.badge.textContent = count > 99 ? '99+' : String(count);
    els.cartBtn.setAttribute(
      'aria-label',
      `Abrir sacola (${count} ${count === 1 ? 'item' : 'itens'})`
    );
  }

  function bumpBadge() {
    // Reinicia a animação mesmo em cliques seguidos
    els.badge.classList.remove('is-bump');
    void els.badge.offsetWidth;
    els.badge.classList.add('is-bump');
  }

  function renderItem(item) {
    const product = getProductById(item.id);
    const color = getProductColor(product, item.cor);
    const key = keyOf(item);
    // Nome completo para leitores de tela e botões ("Shorts Tactel — Limão — M")
    const name = escapeHTML([product.nome, color?.nome, item.tam].filter(Boolean).join(' — '));
    // Itens adicionados antes de existir o tamanho ficam como "não informado"
    const sizeText = product.tamanhos?.length ? `Tamanho: ${item.tam || 'não informado'}` : '';
    const details = [color && `Cor: ${color.nome}`, sizeText].filter(Boolean).join(' · ');
    const colorLine = details
      ? `<p class="cart-item__color">${escapeHTML(details)}</p>`
      : '';

    return `
      <li class="cart-item" data-key="${key}">
        <!-- TROCAR IMAGEM: usa a miniatura da cor (ou product.imagem); placeholder automático se não existir -->
        <img class="cart-item__thumb" src="${getProductThumb(product, item.cor)}" alt="${name}"
             width="72" height="72" loading="lazy" data-fallback-name="${escapeHTML(product.nome)}">
        <div class="cart-item__body">
          <p class="cart-item__collection">${escapeHTML(product.colecao)}</p>
          <h3 class="cart-item__name">${escapeHTML(product.nome)}</h3>
          ${colorLine}
          <div class="cart-item__controls">
            <div class="qty" role="group" aria-label="Quantidade de ${name}">
              <button class="qty__btn" type="button" data-action="decrease" data-key="${key}"
                      aria-label="Diminuir quantidade de ${name}">
                <svg class="icon icon--xs" aria-hidden="true"><use href="#icon-minus"></use></svg>
              </button>
              <span class="qty__value" aria-live="polite">${item.qty}</span>
              <button class="qty__btn" type="button" data-action="increase" data-key="${key}"
                      aria-label="Aumentar quantidade de ${name}" ${item.qty >= 99 ? 'disabled' : ''}>
                <svg class="icon icon--xs" aria-hidden="true"><use href="#icon-plus"></use></svg>
              </button>
            </div>
            <button class="cart-item__remove" type="button" data-action="remove" data-key="${key}"
                    aria-label="Remover ${name} da sacola">Remover</button>
          </div>
        </div>
        <p class="cart-item__price">${formatPrice(product.preco * item.qty)}</p>
      </li>
    `;
  }

  function render() {
    if (!els.list) return;

    // Guarda qual botão estava com foco para restaurar após re-renderizar
    const active = document.activeElement;
    const focusKey = els.list.contains(active) && active.dataset.action
      ? { action: active.dataset.action, key: active.dataset.key }
      : null;

    const count = getCount();
    const isEmpty = items.length === 0;

    els.list.innerHTML = items.map(renderItem).join('');
    els.panel.classList.toggle('mini-cart--empty', isEmpty);
    els.count.textContent = isEmpty ? '' : `(${count})`;
    els.subtotal.textContent = formatPrice(getSubtotal());
    els.checkout.disabled = isEmpty;

    renderBadge();

    // Restaura o foco (ou o leva ao botão de fechar se o item sumiu)
    if (focusKey) {
      const target =
        els.list.querySelector(`[data-action="${focusKey.action}"][data-key="${focusKey.key}"]`) ||
        els.list.querySelector('[data-action]') ||
        els.panel.querySelector('[data-drawer-close]');
      target?.focus();
    }
  }

  /* ---------- Inicialização ---------- */
  function init() {
    els = {
      panel: document.getElementById('mini-cart'),
      list: document.querySelector('.mini-cart__list'),
      count: document.querySelector('.mini-cart__count'),
      subtotal: document.querySelector('.mini-cart__subtotal-value'),
      checkout: document.querySelector('.mini-cart__checkout'),
      badge: document.querySelector('.header__badge'),
      cartBtn: document.querySelector('.header__cart-btn'),
      overlay: document.querySelector('[data-overlay="cart"]'),
    };

    if (!els.panel) return;

    // createDrawer é definido em main.js (foco preso, Esc, overlay)
    drawer = createDrawer({
      panel: els.panel,
      overlay: els.overlay,
      trigger: els.cartBtn,
    });

    els.cartBtn.addEventListener('click', () => drawer.open());

    // Delegação: + / − / remover
    els.list.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-action]');
      if (!btn) return;

      const { action, key } = btn.dataset;
      if (action === 'increase') changeQty(key, 1);
      if (action === 'decrease') changeQty(key, -1);
      if (action === 'remove') remove(key);
    });

    els.checkout.addEventListener('click', checkout);

    // Sincroniza entre abas abertas do simulador
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        items = sanitize(storage.get(STORAGE_KEY, []));
        render();
      }
    });

    render();
  }

  return { init, add, remove, clear, getCount };
})();
