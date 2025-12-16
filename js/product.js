document.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(window.location.search);
  const name = p.get('name') ? decodeURIComponent(p.get('name')) : 'Название товара';
  const price = p.get('price') ? parseInt(p.get('price')) : 0;
  const img = p.get('image') ? decodeURIComponent(p.get('image')) : '../images/kurtka1.jpg';
  
  const product = { id: p.get('id') || 'unknown', name, price, image: img.startsWith('../') ? img : '../' + img, desc: 'Описание будет добавлено.', category: 'top', isNew: false };

  const imgEl = document.querySelector('[data-product-image]');
  if (imgEl) {
    imgEl.src = product.image;
    imgEl.alt = product.name;
    imgEl.style.display = 'block';
    imgEl.onerror = () => { imgEl.src = '../images/kurtka1.jpg'; imgEl.onerror = null; };
    imgEl.onload = () => { imgEl.style.opacity = '1'; };
  }
  
  const titleEl = document.querySelector('[data-product-title]');
  const priceEl = document.querySelector('[data-product-price]');
  const descEl = document.querySelector('[data-product-desc]');
  const collectionEl = document.querySelector('[data-product-collection]');
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = new Intl.NumberFormat('ru-RU').format(product.price) + ' ₽';
  if (descEl) descEl.textContent = product.desc;
  if (collectionEl) collectionEl.textContent = 'ECLIPSE / LIMITED';

  let selectedSize = 'S';
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('size-btn--active'));
      this.classList.add('size-btn--active');
      selectedSize = this.textContent.trim();
    });
  });

  const addBtn = document.querySelector('.product-hero__cta');
  if (addBtn && typeof addToCart === 'function') {
    addBtn.addEventListener('click', () => addToCart({ ...product, size: selectedSize }));
  }
});
