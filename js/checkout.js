document.addEventListener('DOMContentLoaded', function() {
  const formatter = new Intl.NumberFormat('ru-RU');
  
  let cart = [];
  try {
    const saved = localStorage.getItem('eclipseCart');
    if (saved) cart = JSON.parse(saved);
  } catch { cart = []; }

  if (cart.length === 0) {
    alert('Ваша корзина пуста. Добавьте товары для оформления заказа.');
    window.location.href = '../index.html';
    return;
  }

  const summaryItemsEl = document.getElementById('summary-items');
  const summaryTotalEl = document.getElementById('summary-total');
  
  function formatPrice(value) {
    return `${formatter.format(value)} ₽`;
  }

  function resolveImage(imagePath) {
    if (!imagePath) return '../images/kurtka1.jpg';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('file:')) return imagePath;
    if (imagePath.startsWith('/')) return imagePath;
    return imagePath.startsWith('../') ? imagePath : '../' + imagePath;
  }

  function getDeliveryCost() {
    const delivery = document.getElementById('delivery').value;
    return delivery === 'courier' ? 500 : delivery === 'post' ? 300 : 0;
  }

  function renderSummary() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryCost = getDeliveryCost();
    const total = subtotal + deliveryCost;
    summaryItemsEl.innerHTML = cart.map(i => {
      const t = i.price * i.qty;
      return `<div class="summary-item">
        <img src="${resolveImage(i.image || '../images/kurtka1.jpg')}" alt="${i.name}" class="summary-item__image" onerror="this.src='../images/kurtka1.jpg'">
        <div class="summary-item__info"><p>${i.name}</p><span>Количество: ${i.qty}</span></div>
        <div class="summary-item__price">${formatPrice(t)}</div>
      </div>`;
    }).join('');

    summaryTotalEl.innerHTML = `<div class="summary-total-row"><span>Товары (${cart.reduce((s, i) => s + i.qty, 0)} шт.)</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-total-row"><span>Доставка</span><span id="delivery-cost">${deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно'}</span></div>
      <div class="summary-total-row"><span>Итого</span><span id="total-price">${formatPrice(total)}</span></div>`;
  }

  document.getElementById('delivery').addEventListener('change', renderSummary);
  renderSummary();

  try {
    const savedProfile = localStorage.getItem('eclipseProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.name) document.getElementById('name').value = profile.name;
      if (profile.email) document.getElementById('email').value = profile.email;
      if (profile.phone) document.getElementById('phone').value = profile.phone;
      if (profile.address) document.getElementById('address').value = profile.address;
    }
  } catch {}

  document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const orderData = {
      ...Object.fromEntries(formData.entries()),
      items: cart,
      total: subtotal + getDeliveryCost(),
      date: new Date().toISOString(),
      orderId: 'ECL-' + Date.now()
    };

    try {
      const orders = JSON.parse(localStorage.getItem('eclipseOrders') || '[]');
      orders.push(orderData);
      localStorage.setItem('eclipseOrders', JSON.stringify(orders));
    } catch {}

    localStorage.removeItem('eclipseCart');
    alert(`Заказ оформлен успешно!\nНомер заказа: ${orderData.orderId}\nМы свяжемся с вами для подтверждения.`);
    window.location.href = '../index.html';
  });
});
