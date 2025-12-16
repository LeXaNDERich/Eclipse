document.addEventListener('DOMContentLoaded', () => {
  const categoryNames = { jacket: 'Куртки', tshirt: 'Футболки', underwear: 'Нижняя одежда', blazer: 'Пиджаки', evening: 'Вечерний', formal: 'Официальный', coat: 'Пальто' };
  
  document.querySelectorAll('.catalog-card-link').forEach(link => {
    const cat = link.getAttribute('data-category') || '';
    const span = link.querySelector('.catalog-card__meta span');
    if (span) {
      const firstCat = cat.split(' ')[0];
      span.textContent = categoryNames[firstCat] || firstCat;
    }
  });

  const cardLinks = document.querySelectorAll('.catalog-card-link');
  const filterButtons = document.querySelectorAll('.catalog-filters .chip');
  const catalogCards = document.querySelectorAll('.catalog-card-link');

  cardLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Если клик по кнопке "Добавить в корзину" — не перехватываем,
      // чтобы сработал общий обработчик add-to-cart из app.js
      if (e.target.closest('[data-add-to-cart]')) return;

      e.preventDefault();
      const card = this.querySelector('.catalog-card');
      if (!card) return;
      const img = card.querySelector('img');
      if (!img) { window.location.href = this.getAttribute('href'); return; }
      
      const meta = card.querySelector('.catalog-card__meta');
      const name = meta?.querySelector('p')?.textContent.trim() || '';
      const price = meta?.querySelector('strong')?.textContent.replace(/\s/g, '').replace('₽', '') || '';
      let imgSrc = (img.getAttribute('src') || img.src).replace(/^\.\.\//, '');
      
      let url = `product.html?id=${encodeURIComponent(card.dataset.productId || '')}&image=${encodeURIComponent(imgSrc)}`;
      if (name) url += `&name=${encodeURIComponent(name)}`;
      if (price) url += `&price=${encodeURIComponent(price)}`;
      window.location.href = url;
    });
  });

  const applyFilter = (val) => {
    catalogCards.forEach(c => {
      c.style.display = val === 'all' || (c.getAttribute('data-category') || '').includes(val) ? '' : 'none';
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      filterButtons.forEach(b => b.classList.remove('chip--active'));
      this.classList.add('chip--active');
      applyFilter(this.getAttribute('data-filter') || 'all');
    });
  });

  const filterParam = new URLSearchParams(window.location.search).get('filter');
  if (filterParam) {
    const targetBtn = Array.from(filterButtons).find(b => b.getAttribute('data-filter') === filterParam);
    if (targetBtn) {
      filterButtons.forEach(b => b.classList.remove('chip--active'));
      targetBtn.classList.add('chip--active');
      applyFilter(filterParam);
    }
  }

  // Синхронизация одинаковых товаров по ID:
  // если один и тот же товар (data-product-id) встречается в нескольких карточках,
  // везде используем одно и то же название и цену — как в первой найденной карточке.
  const syncById = () => {
    const map = {};

    document.querySelectorAll('.catalog-card').forEach(card => {
      const id = card.dataset.productId;
      if (!id || map[id]) return;
      const meta = card.querySelector('.catalog-card__meta');
      if (!meta) return;
      const nameEl = meta.querySelector('p');
      const priceEl = meta.querySelector('strong');
      map[id] = {
        name: nameEl?.textContent.trim() || null,
        price: priceEl?.textContent.trim() || null,
      };
    });

    document.querySelectorAll('.catalog-card').forEach(card => {
      const id = card.dataset.productId;
      const data = map[id];
      if (!id || !data) return;
      const meta = card.querySelector('.catalog-card__meta');
      if (!meta) return;
      const nameEl = meta.querySelector('p');
      const priceEl = meta.querySelector('strong');
      if (data.name && nameEl) nameEl.textContent = data.name;
      if (data.price && priceEl) priceEl.textContent = data.price;
    });
  };

  syncById();
});
