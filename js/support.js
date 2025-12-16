const supportModal = document.getElementById('support-modal');
const openSupportBtn = document.querySelector('[data-open-support]');
const closeSupportBtn = document.querySelector('[data-close-support]');
const supportForm = document.getElementById('support-form');

function closeModal() {
  supportModal.hidden = true;
  document.body.style.overflow = '';
}

if (openSupportBtn) {
  openSupportBtn.addEventListener('click', () => {
    supportModal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
}

if (closeSupportBtn) {
  closeSupportBtn.addEventListener('click', closeModal);
}

if (supportModal) {
  supportModal.addEventListener('click', e => {
    if (e.target === supportModal) closeModal();
  });
}

if (supportForm) {
  supportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const supportData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      date: new Date().toISOString()
    };

    try {
      const supportRequests = JSON.parse(localStorage.getItem('eclipseSupportRequests') || '[]');
      supportRequests.push(supportData);
      localStorage.setItem('eclipseSupportRequests', JSON.stringify(supportRequests));
    } catch {}

    alert('Ваше обращение отправлено! Мы свяжемся с вами в ближайшее время.');
    supportForm.reset();
    closeModal();
  });
}
