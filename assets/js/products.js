/* ==========================================================
   PRODUTOS — dados de exemplo + utilitários compartilhados
   Simulador 100% frontend: não há backend. Os dados vivem aqui.
   ========================================================== */

'use strict';

/**
 * Lista de produtos.
 * categoria: 'feminino' | 'masculino' | 'calcados' | 'acessorios'
 * precoAntigo: opcional (mostra o preço riscado)
 * galeria: opcional — fotos extras exibidas no carrossel da imagem do card
 *          (a 1ª foto é sempre 'imagem'; todas aparecem inteiras no quadro)
 * cores: opcional — variações de cor. Quando existe, as fotos do card vêm da cor
 *        selecionada (a 1ª cor é a padrão: capa do card). Cada cor tem:
 *          id, nome, hex (bolinha do seletor),
 *          imagens: fotos do carrossel; a 1ª é a capa do card (ex.: produto, frente, costas).
 *                   Ao trocar de cor, cada posição vira a foto da mesma posição na nova cor.
 *          miniatura: foto usada no mini-cart.
 *        Ao trocar de cor, cada foto "tinge" de cima para baixo (animação no gallery.js).
 *
 * tamanhos: opcional — lista de tamanhos. Quando existe, o cliente precisa escolher um.
 * aproximarModelo: opcional — true para modelo recortada (fundo transparente): mostra do alto
 *                  até as pernas, dissolvendo embaixo. Na ampliação aparece inteira.
 * inclinacao: opcional — graus de inclinação da capa no card (positivo = para a direita).
 * fotosModelo: opcional — posições (a partir de 0) das fotos de modelo recortada: só elas são
 *              aproximadas. Use quando a capa é a peça e as demais são a modelo.
 * ampliadas: opcional — fotos exibidas ao ampliar, na mesma ordem das do card (ex.: com fundo).
 * preencherFoto: opcional — true para fotos com cenário (preenchem o quadro do card,
 *                cortando as sobras). Na ampliação a foto aparece inteira.
 *
 * TROCAR IMAGEM: coloque as fotos em assets/img/colecoes/<coleção>/<ano>/<produto>/ com os nomes abaixo.
 * Enquanto o arquivo não existir, um placeholder cinza com o nome do produto é exibido.
 */

/** Tamanhos das roupas (escolha obrigatória antes de ir para o carrinho) */
const TAMANHOS_ROUPA = ['P', 'M', 'G', 'Oversized'];

/** Numeração dos calçados (escolha obrigatória antes de ir para o carrinho) */
const TAMANHOS_CALCADO = ['35', '36', '37', '38', '39', '40', '41'];

// TODO: substituir pelos produtos reais
const PRODUCTS = [
  {
    id: 1,
    nome: 'Shorts Tactel',
    colecao: 'Coleção Verão',
    categoria: 'feminino',
    preco: 89.9,
    tamanhos: TAMANHOS_ROUPA,
    precoAntigo: 119.9,
    imagem: 'assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-amora.webp',
    // Cada cor mostra só a foto do produto naquela cor (WebP otimizado de
    // tectellimao.png, tactelamora.png, tactelmaracuja.png, tactelceuazul.png).
    // TROCAR IMAGEM: fotos 2 e 3 do carrossel em cada cor
    //   (assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto2-<cor>.webp e shorts-foto3-<cor>.webp)
    cores: [
      {
        id: 'amora',
        nome: 'Amora',
        hex: '#F276A9',
        imagens: ['assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-amora.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto2-amora.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto3-amora.webp'],
        miniatura: 'assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-amora.webp',
      },
      {
        id: 'limao',
        nome: 'Limão',
        hex: '#6AE629',
        imagens: ['assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-limao.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto2-limao.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto3-limao.webp'],
        miniatura: 'assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-limao.webp',
      },
      {
        id: 'maracuja',
        nome: 'Maracujá',
        hex: '#D2EC28',
        imagens: ['assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-maracuja.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto2-maracuja.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto3-maracuja.webp'],
        miniatura: 'assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-maracuja.webp',
      },
      {
        id: 'ceuazul',
        nome: 'Céu Azul',
        hex: '#44DBF0',
        imagens: ['assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-ceuazul.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto2-ceuazul.webp', 'assets/img/colecoes/verao/2026/shorts-tactel/shorts-foto3-ceuazul.webp'],
        miniatura: 'assets/img/colecoes/verao/2026/shorts-tactel/tactel-produto-ceuazul.webp',
      },
    ],
  },
  {
    // Coleção Regatas — fica logo ao lado do Shorts Tactel (Coleção Verão)
    id: 9,
    nome: 'Regata Cropped',
    colecao: 'Coleção Regatas',
    categoria: 'feminino',
    preco: 69.9,
    tamanhos: TAMANHOS_ROUPA,
    imagem: 'assets/img/colecoes/regatas/2026/regata-cropped/regata-limao.webp',
    fotosModelo: [1, 2], // fotos 2 e 3: modelo recortada, aproximada no card
    // Fotos na pasta do produto (PNGs em originais/): versões WebP de regaculimao.png, regacuamora.png...
    // TROCAR IMAGEM: fotos da modelo de frente/costas em cada cor
    //   (assets/img/colecoes/regatas/2026/regata-cropped/regata-frente-<cor>.webp e regata-costas-<cor>.webp)
    cores: [
      {
        id: 'limao',
        nome: 'Limão',
        hex: '#61DF35',
        imagens: ['assets/img/colecoes/regatas/2026/regata-cropped/regata-limao.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-frente-limao.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-costas-limao.webp'],
        miniatura: 'assets/img/colecoes/regatas/2026/regata-cropped/regata-limao.webp',
      },
      {
        id: 'ceuazul',
        nome: 'Céu Azul',
        hex: '#47AEBE',
        imagens: ['assets/img/colecoes/regatas/2026/regata-cropped/regata-ceuazul.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-frente-ceuazul.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-costas-ceuazul.webp'],
        miniatura: 'assets/img/colecoes/regatas/2026/regata-cropped/regata-ceuazul.webp',
      },
      {
        id: 'amora',
        nome: 'Amora',
        hex: '#F95592',
        imagens: ['assets/img/colecoes/regatas/2026/regata-cropped/regata-amora.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-frente-amora.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-costas-amora.webp'],
        miniatura: 'assets/img/colecoes/regatas/2026/regata-cropped/regata-amora.webp',
      },
      {
        id: 'maracuja',
        nome: 'Maracujá',
        hex: '#DFDF97',
        // TODO: foto em baixa resolução (406px) — trocar por uma versão maior
        imagens: ['assets/img/colecoes/regatas/2026/regata-cropped/regata-maracuja.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-frente-maracuja.webp', 'assets/img/colecoes/regatas/2026/regata-cropped/regata-costas-maracuja.webp'],
        miniatura: 'assets/img/colecoes/regatas/2026/regata-cropped/regata-maracuja.webp',
      },
    ],
  },
  {
    id: 2,
    nome: 'Camisa Oversized Algodão Branca',
    colecao: 'Linha Essencial',
    categoria: 'masculino',
    preco: 189.9,
    tamanhos: TAMANHOS_ROUPA,
    imagem: 'assets/img/colecoes/essencial/2026/camisa-oversized/camisanovasenta.webp',
    aproximarModelo: true, // recorte de corpo inteiro: aproxima no card
    galeria: ['assets/img/colecoes/essencial/2026/camisa-oversized/camisanovape.webp', 'assets/img/colecoes/essencial/2026/camisa-oversized/camisanovacosta.webp'],
    ampliadas: ['assets/img/colecoes/essencial/2026/camisa-oversized/modelooversize.webp', 'assets/img/colecoes/essencial/2026/camisa-oversized/modelooversizeempe.webp', 'assets/img/colecoes/essencial/2026/camisa-oversized/modelooversizecosta.webp'], // com fundo, na mesma ordem
  },
  {
    id: 3,
    nome: 'Chinela Plataforma',
    colecao: 'Coleção Verão',
    categoria: 'calcados',
    preco: 219.9, // TODO: confirmar preço (herdado do card da Sandália Rasteira)
    tamanhos: TAMANHOS_CALCADO,
    imagem: 'assets/img/colecoes/verao/2026/chinela-plataforma/chinela-limao.webp',
    // Fotos na pasta do produto (PNGs em originais/): versões WebP de sandalialimao.png, sandaliaamora.png...
    // TROCAR IMAGEM: fotos 2 e 3 do carrossel em cada cor
    //   (assets/img/colecoes/verao/2026/chinela-plataforma/chinela-foto2-<cor>.webp e chinela-foto3-<cor>.webp)
    cores: [
      { id: 'limao', nome: 'Limão', hex: '#A1C738' },
      { id: 'amora', nome: 'Amora', hex: '#F14C8B' },
      { id: 'maracuja', nome: 'Maracujá', hex: '#E9D279' },
      { id: 'ceuazul', nome: 'Céu Azul', hex: '#32A7D8' },
      { id: 'nuvem', nome: 'Nuvem', hex: '#F4F4F4' },
      { id: 'pedra', nome: 'Pedra', hex: '#2F2F2F' },
    ].map((cor) => ({
      ...cor,
      imagens: [
        `assets/img/colecoes/verao/2026/chinela-plataforma/chinela-${cor.id}.webp`,
        `assets/img/colecoes/verao/2026/chinela-plataforma/chinela-foto2-${cor.id}.webp`,
        `assets/img/colecoes/verao/2026/chinela-plataforma/chinela-foto3-${cor.id}.webp`,
      ],
      miniatura: `assets/img/colecoes/verao/2026/chinela-plataforma/chinela-${cor.id}.webp`,
    })),
  },
  {
    id: 4,
    nome: 'Bolsa de Palha Trançada',
    colecao: 'Beira-mar',
    categoria: 'acessorios',
    preco: 159.9,
    precoAntigo: 199.9,
    imagem: 'assets/img/colecoes/beira-mar/2026/bolsa-palha/bolsa-ceuazul.webp',
    // PNGs originais (bagnatual.png, baglimao.png...) em originais/
    // TROCAR IMAGEM: fotos 2 e 3 do carrossel em cada cor
    //   (bolsa-foto2-<cor>.webp e bolsa-foto3-<cor>.webp, na pasta do produto)
    cores: [
      { id: 'ceuazul', nome: 'Céu Azul', hex: '#9FB7C2' },
      { id: 'maracuja', nome: 'Maracujá', hex: '#DABB1E' },
      { id: 'laranja', nome: 'Laranja', hex: '#E46C2A' },
      // TODO: o original da Natural é pequeno (351px) — trocar por uma versão maior
      { id: 'natural', nome: 'Natural', hex: '#B98F6C' },
      { id: 'limao', nome: 'Limão', hex: '#9CCB35' },
      { id: 'amora', nome: 'Amora', hex: '#E4407A' },
    ].map((cor) => ({
      ...cor,
      imagens: [
        `assets/img/colecoes/beira-mar/2026/bolsa-palha/bolsa-${cor.id}.webp`,
        `assets/img/colecoes/beira-mar/2026/bolsa-palha/bolsa-foto2-${cor.id}.webp`,
        `assets/img/colecoes/beira-mar/2026/bolsa-palha/bolsa-foto3-${cor.id}.webp`,
      ],
      miniatura: `assets/img/colecoes/beira-mar/2026/bolsa-palha/bolsa-${cor.id}.webp`,
    })),
  },
  {
    id: 6,
    nome: 'Bermuda Chino Areia',
    colecao: 'Coleção Verão',
    categoria: 'masculino',
    preco: 169.9,
    tamanhos: TAMANHOS_ROUPA,
    imagem: 'assets/img/colecoes/verao/2026/bermuda-chino/bermudanovape.webp',
    aproximarModelo: true, // recorte de corpo inteiro: aproxima no card
    galeria: ['assets/img/colecoes/verao/2026/bermuda-chino/bermudanovacosta.webp', 'assets/img/colecoes/verao/2026/bermuda-chino/bermudanovasenta.webp'],
    ampliadas: ['assets/img/colecoes/verao/2026/bermuda-chino/bermudacapa.webp', 'assets/img/colecoes/verao/2026/bermuda-chino/bermudacosta.webp', 'assets/img/colecoes/verao/2026/bermuda-chino/bermudasenta.webp'], // com fundo, na mesma ordem
  },
  {
    id: 10,
    nome: 'Garrafa Térmica Flamingo',
    colecao: 'Linha Essencial',
    categoria: 'acessorios',
    preco: 299.9, // TODO: confirmar preço da garrafa
    precoAntigo: 379.9,
    imagem: 'assets/img/colecoes/essencial/2026/garrafa-termica/garrafabeiracu.webp',
    inclinacao: 10, // graus, só na capa do card
    galeria: ['assets/img/colecoes/essencial/2026/garrafa-termica/garrafa-2.webp', 'assets/img/colecoes/essencial/2026/garrafa-termica/garrafa-3.webp'], // TROCAR IMAGEM
  },
  {
    id: 8,
    nome: 'Óculos de Sol Acetato Tartaruga',
    colecao: 'Beira-mar',
    categoria: 'acessorios',
    preco: 189.9,
    imagem: 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosrosacapa.webp',
    // Cor da lente
    cores: [
      {
        id: 'rosa',
        nome: 'Rosa',
        hex: '#F07F8E',
        imagens: ['assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosrosacapa.webp', 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosrosaaberto.webp', 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosrosacosta.webp'],
        miniatura: 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosrosacapa.webp',
      },
      {
        id: 'amarelo',
        nome: 'Amarelo',
        hex: '#F3B63F',
        imagens: ['assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculoscapa.webp', 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculosaberto.webp', 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculoscosta.webp'],
        miniatura: 'assets/img/colecoes/beira-mar/2026/oculos-tartaruga/oculoscapa.webp',
      },
    ],
  },
];


/* ----------------------------------------------------------
   UTILITÁRIOS (usados por main.js e cart.js)
   ---------------------------------------------------------- */

/** Formatador de moeda em reais: 189.9 → "R$ 189,90" */
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatPrice(value) {
  return currencyFormatter.format(value);
}

/** Busca um produto pelo id */
function getProductById(id) {
  return PRODUCTS.find((product) => product.id === Number(id));
}

/** Tamanho válido do produto; null se não existe ou não foi escolhido */
function getProductSize(product, size) {
  return product.tamanhos?.includes(size) ? size : null;
}

/** Cor de um produto pelo id (ou a cor padrão); null se o produto não tem cores */
function getProductColor(product, colorId) {
  if (!product.cores?.length) return null;
  return product.cores.find((cor) => cor.id === colorId) || product.cores[0];
}

/** Todas as fotos de um produto (da cor escolhida, se houver cores) */
function getProductImages(product, colorId) {
  const color = getProductColor(product, colorId);
  if (color) return color.imagens;
  return [product.imagem, ...(product.galeria || [])].filter(Boolean);
}

/** Fotos exibidas ao ampliar: "ampliadas" (se houver) ou as mesmas do card */
function getProductZoomImages(product, colorId) {
  const images = getProductImages(product, colorId);
  return images.map((src, i) => product.ampliadas?.[i] || src);
}

/** Foto pequena usada no mini-cart */
function getProductThumb(product, colorId) {
  const color = getProductColor(product, colorId);
  return color ? (color.miniatura || color.imagens[0]) : product.imagem;
}

/** Escapa texto para inserir com segurança em HTML */
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

/**
 * Gera um placeholder SVG (data URI) cinza com o nome do produto.
 * TROCAR IMAGEM: deixa de ser usado assim que a foto real existir.
 */
function getPlaceholderImage(text) {
  // Quebra o nome em até 3 linhas de ~18 caracteres
  const words = String(text).split(' ');
  const lines = [];
  let current = '';

  words.forEach((word) => {
    if ((current + ' ' + word).trim().length > 18) {
      lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  });
  lines.push(current.trim());

  const visibleLines = lines.slice(0, 3);
  const startY = 300 - ((visibleLines.length - 1) * 30) / 2;

  const tspans = visibleLines
    .map((line, i) => `<tspan x="300" y="${startY + i * 30}">${escapeHTML(line)}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="none"/>
    <text font-family="Outfit, Arial, sans-serif" font-size="22" fill="#1A1A1A"
          text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${tspans}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Leitura/escrita segura no localStorage (pode falhar em aba anônima,
 * com armazenamento bloqueado ou cheio).
 */
const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Sem armazenamento disponível: o estado continua só em memória
    }
  },
};
