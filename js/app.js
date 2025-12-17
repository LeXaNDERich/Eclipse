const body = document.body;
const overlay = document.querySelector('[data-overlay]');
const panels = document.querySelectorAll('.panel');
const formatter = new Intl.NumberFormat('ru-RU');
const formatPrice = (v) => `${formatter.format(v)} ₽`;

// Прокрутка вверх
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'instant' });
window.addEventListener('beforeunload', scrollTop);
scrollTop();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scrollTop);
else scrollTop();

// Корзина
const MAX_CART_ITEMS = 20;
let cart = [];
const loadCart = () => {
  try { cart = JSON.parse(localStorage.getItem('eclipseCart') || '[]'); } catch { cart = []; }
};
const saveCart = () => {
  try {
    localStorage.setItem('eclipseCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch {}
};

const products = [
  { id: 'shadow-jacket-1', name: 'Shadow Jacket', price: 18000, category: 'top', isNew: true, image: 'images/kurtka1.jpg' },
  { id: 'shadow-jacket-2', name: 'Nebula Coat', price: 19200, category: 'top', isNew: true, image: 'images/kurtka2.jpg' },
  { id: 'shadow-jacket-3', name: 'Eclipse Hoodie', price: 16500, category: 'top', isNew: false, image: 'images/tishka1.jpg' },
  { id: 'shadow-jacket-4', name: 'Nightfall Pants', price: 17500, category: 'bottom', isNew: true, image: 'images/pants1.jpg' },
  { id: 'shadow-jacket-5', name: 'Gravité Cargo', price: 16800, category: 'bottom', isNew: false, image: 'images/pants2.jpg' },
  { id: 'shadow-jacket-6', name: 'Lunar Skirt', price: 14900, category: 'bottom', isNew: true, image: 'images/pants3.jpg' },
];

// Панели
const openPanel = (name) => {
  panels.forEach(p => {
    const m = p.dataset.panel === name;
    p.classList.toggle('panel--visible', m);
    p.setAttribute('aria-hidden', !m);
  });
  if (overlay) {
    overlay.hidden = false;
    overlay.classList.add('is-visible');
    body.classList.add('panel-open');
  }
};
const closePanels = () => {
  panels.forEach(p => { p.classList.remove('panel--visible'); p.setAttribute('aria-hidden', 'true'); });
  if (overlay) {
    overlay.classList.remove('is-visible');
    setTimeout(() => overlay.hidden = true, 250);
    body.classList.remove('panel-open');
  }
};

document.querySelectorAll('[data-panel-target]').forEach(b => b.addEventListener('click', () => openPanel(b.dataset.panelTarget)));
document.querySelectorAll('[data-close-panel]').forEach(b => b.addEventListener('click', closePanels));
overlay?.addEventListener('click', closePanels);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanels(); });

// UI корзины
const updateCartUI = () => {
  loadCart();
  const bp = window.location.pathname.includes('/pages/') ? '../' : '';
  const img = (p) => !p ? `${bp}images/kurtka1.jpg` : p.startsWith('http') || p.startsWith('data:') || p.startsWith('file:') || p.startsWith('/') ? p : `${bp}${p.replace(/^(\.\.\/)+/, '')}`;
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const isEmpty = !cart.length;
  
  document.querySelectorAll('[data-cart-count]').forEach(e => { e.textContent = total; e.classList.toggle('is-visible', total > 0); });
  document.querySelectorAll('[data-cart-empty]').forEach(e => e.hidden = !isEmpty);
  document.querySelectorAll('[data-cart-total]').forEach(e => e.textContent = formatPrice(isEmpty ? 0 : cart.reduce((s, i) => s + i.price * i.qty, 0)));
  document.querySelectorAll('[data-cart-list]').forEach(e => {
    e.innerHTML = isEmpty ? '' : cart.map(i => `
      <li class="cart-item" data-id="${i.id}">
        <div class="cart-item__image"><img src="${img(i.image)}" alt="${i.name}" onerror="this.src='${img('images/kurtka1.jpg')}'"></div>
        <div class="cart-item__content">
          <div class="cart-item__top"><p>${i.name}</p><span>${formatPrice(i.price)}</span></div>
          <div class="cart-item__actions">
            <button class="qty-btn" type="button" data-action="decrease">-</button><span>${i.qty}</span>
            <button class="qty-btn" type="button" data-action="increase">+</button>
            <button class="cart-item__remove" type="button" data-action="remove">Удалить</button>
          </div>
        </div>
      </li>
    `).join('');
  });
};

// Уведомление
const notify = (name) => {
  const n = document.createElement('div');
  n.className = 'cart-notification';
  n.innerHTML = `<div class="cart-notification__content"><i class="fa-solid fa-check"></i><span>${name} добавлен в корзину</span></div>`;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add('is-visible'), 10);
  setTimeout(() => { n.classList.remove('is-visible'); setTimeout(() => n.remove(), 300); }, 3000);
};

// Добавление в корзину
const addToCart = (p) => {
  loadCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (total >= MAX_CART_ITEMS) { alert(`В корзине может быть не более ${MAX_CART_ITEMS} товаров.`); return; }
  const e = cart.find(i => i.id === p.id);
  if (e) {
    if (total + 1 > MAX_CART_ITEMS) { alert(`В корзине может быть не более ${MAX_CART_ITEMS} товаров.`); return; }
    e.qty++;
  } else {
    cart.push({ ...p, qty: 1 });
  }
  saveCart();
  updateCartUI();
  notify(p.name);
};

// Обработчики кликов
document.addEventListener('click', e => {
  const a = e.target.closest('button[data-action]');
  if (a) {
    const ci = a.closest('.cart-item');
    if (ci) {
      loadCart();
      const id = ci.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) {
        if (a.dataset.action === 'increase') {
          const total = cart.reduce((s, i) => s + i.qty, 0);
          if (total >= MAX_CART_ITEMS) { alert(`В корзине может быть не более ${MAX_CART_ITEMS} товаров.`); return; }
          item.qty++;
        }
        else if (a.dataset.action === 'decrease') item.qty = Math.max(1, item.qty - 1);
        else if (a.dataset.action === 'remove') cart.splice(cart.findIndex(i => i.id === id), 1);
        saveCart();
        updateCartUI();
      }
      return;
    }
  }
  
  const cb = e.target.closest('[data-checkout]');
  if (cb) {
    loadCart();
    if (!cart.length) { alert('Ваша корзина пуста. Добавьте товары для оформления заказа.'); return; }
    closePanels();
    window.location.href = window.location.pathname.includes('/pages/') ? 'checkout.html' : 'pages/checkout.html';
    return;
  }
  
  const ac = e.target.closest('[data-add-to-cart]');
  if (ac) {
    e.preventDefault();
    e.stopPropagation();
    const card = ac.closest('.catalog-card') || ac.closest('[data-product-card]');
    const id = card?.dataset.productId || ac.dataset.productId;
    const meta = card?.querySelector('.catalog-card__meta') || card?.querySelector('.card__info');

    // Всегда сначала пробуем взять данные с карточки (каталоги, главная)
    const fromCard = (card && meta) ? {
      id,
      name: meta.querySelector('p')?.textContent.trim() || 'Товар',
      price: parseInt(
        (meta.querySelector('strong') || meta.querySelector('.price'))?.
          textContent.replace(/\s/g, '').replace('₽', '') || '0',
        10
      ) || 0,
      image: (card.querySelector('img')?.getAttribute('src') || '')
        .replace(/^\.\.\//, '') || 'images/kurtka1.jpg',
      category: card.getAttribute('data-category') || 'top',
      isNew: card.querySelector('.catalog-tag')?.textContent.toLowerCase().includes('новинка') || false
    } : null;

    // Если по какой‑то причине карточки нет, используем предопределённые продукты (главный блок на index)
    const p = fromCard || products.find(p => p.id === id) || null;
    if (p) addToCart(p);
    return;
  }
  
  const pc = e.target.closest('[data-product-card]');
  if (pc) {
    const id = pc.dataset.productId;
    const info = pc.querySelector('.card__info');
    const name = info?.querySelector('p')?.textContent.trim() || '';
    const price = info?.querySelector('.price')?.textContent.replace(/\s/g, '').replace('₽', '') || '';
    let img = pc.querySelector('img')?.getAttribute('src')?.replace(/^\.\.\//, '') || '';
    if (img.includes('/')) img = img.split('/').slice(-2).join('/');
    const bp = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    let url = `${bp}product.html?id=${encodeURIComponent(id)}${img ? `&image=${encodeURIComponent(img)}` : ''}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (price) url += `&price=${encodeURIComponent(price)}`;
    window.location.href = url;
  }
});

// Продукты
const productGrid = document.querySelector('[data-product-grid]');
const filterButtons = document.querySelectorAll('[data-filter]');
const renderProducts = (list) => {
  if (!productGrid) return;
  productGrid.innerHTML = list.map(i => `
    <article class="card" data-product-card data-product-id="${i.id}" data-product-name="${i.name}" data-product-price="${i.price}">
      <div class="card__media"><img src="${i.image}" alt="${i.name}"></div>
      <div class="card__info"><p>${i.name.toUpperCase()}</p><p class="price">${formatPrice(i.price)}</p></div>
      <button class="card__cta-btn" data-add-to-cart data-product-id="${i.id}">ДОБАВИТЬ В КОРЗИНУ</button>
    </article>
  `).join('');
};

const applyFilter = (t) => {
  const f = t === 'new' ? products.filter(i => i.isNew) : t === 'top' ? products.filter(i => i.category === 'top') : t === 'bottom' ? products.filter(i => i.category === 'bottom') : products;
  renderProducts(f);
};

filterButtons.forEach(b => b.addEventListener('click', () => {
  filterButtons.forEach(btn => btn.classList.remove('chip--active'));
  b.classList.add('chip--active');
  applyFilter(b.dataset.filter);
}));

// Профиль
const profileForm = document.querySelector('[data-profile-form]');
profileForm?.addEventListener('submit', e => {
  e.preventDefault();
  localStorage.setItem('eclipseProfile', JSON.stringify(Object.fromEntries(new FormData(profileForm))));
  alert('Данные сохранены!');
  closePanels();
});

const restoreProfile = () => {
  if (!profileForm) return;
  try {
    const d = JSON.parse(localStorage.getItem('eclipseProfile') || '{}');
    Object.entries(d).forEach(([k, v]) => { const f = profileForm.elements[k]; if (f) f.value = v; });
  } catch {}
};

// Авторизация
const checkUserAuth = () => {
  try { return JSON.parse(localStorage.getItem('eclipseCurrentUser') || 'null'); } catch { return null; }
};

const updateProfileLink = () => {
  const user = checkUserAuth();
  const bp = window.location.pathname.includes('/pages/') ? '' : 'pages/';
  document.querySelectorAll('.icon-btn--profile, a[href*="register.html"]').forEach(l => {
    if (user) { l.href = `${bp}profile.html`; l.setAttribute('title', 'Личный кабинет'); }
    else { l.href = `${bp}register.html`; l.setAttribute('title', 'Регистрация'); }
  });
};

// Мобильное меню
const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
if (mobileMenuToggle && mobileMenu) {
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenuToggle.classList.remove('is-active');
    body.classList.remove('menu-open');
  };
  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileMenuToggle.classList.add('is-active');
    body.classList.add('menu-open');
  };
  
  mobileMenuToggle.addEventListener('click', e => {
    e.stopPropagation();
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  
  mobileMenu.querySelectorAll('a:not(.mobile-menu-link)').forEach(l => {
    l.addEventListener('click', () => l.getAttribute('href')?.startsWith('#') ? setTimeout(closeMenu, 300) : closeMenu());
  });
  
  const al = mobileMenu.querySelector('a.mobile-menu-link[href*="register"], a.mobile-menu-link[href*="profile"]');
  if (al) al.addEventListener('click', () => setTimeout(closeMenu, 200));
  
  const cb = mobileMenu.querySelector('button.mobile-menu-link[data-panel-target="cart"]');
  if (cb) cb.addEventListener('click', e => { e.stopPropagation(); setTimeout(closeMenu, 150); });
  
  const handleOutside = (e) => {
    if (body.classList.contains('menu-open') && !mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target) && !e.target.closest('.panel')) closeMenu();
  };
  document.addEventListener('mousedown', handleOutside);
  document.addEventListener('touchstart', handleOutside);
}

// Инициализация
loadCart();
updateCartUI();
restoreProfile();
applyFilter('all');
updateProfileLink();

window.addEventListener('storage', e => { if (e.key === 'eclipseCart') { loadCart(); updateCartUI(); } });
window.addEventListener('cartUpdated', () => { loadCart(); updateCartUI(); });
document.querySelectorAll('[data-panel-target="cart"]').forEach(b => b.addEventListener('click', () => { loadCart(); updateCartUI(); }));
