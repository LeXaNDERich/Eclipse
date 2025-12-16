const authForm = document.querySelector('[data-auth-form]');
const toggleButtons = document.querySelectorAll('[data-mode]');
const registerFields = document.querySelectorAll('[data-register-field]');
const submitBtn = document.querySelector('[data-submit-btn]');
const authText = document.querySelector('[data-auth-text]');

let currentMode = 'register';

function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '' : 'pages/';
}

toggleButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    const mode = this.getAttribute('data-mode');
    if (mode === currentMode) return;
    
    currentMode = mode;
    toggleButtons.forEach(b => b.classList.remove('auth-toggle__btn--active'));
    this.classList.add('auth-toggle__btn--active');
    
    if (mode === 'register') {
      registerFields.forEach(field => {
        field.style.display = 'block';
        const input = field.querySelector('input');
        if (input) input.required = true;
      });
      submitBtn.textContent = 'СОЗДАТЬ АККАУНТ';
      authText.textContent = 'Создайте профиль, чтобы управлять заказами и бонусами';
    } else {
      registerFields.forEach(field => {
        field.style.display = 'none';
        const input = field.querySelector('input');
        if (input) input.required = false;
      });
      submitBtn.textContent = 'ВОЙТИ';
      authText.textContent = 'Войдите в свой аккаунт';
    }
    
    authForm.reset();
  });
});

authForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const email = formData.get('email');
  const password = formData.get('password');
  const existingUsers = JSON.parse(localStorage.getItem('eclipseUsers') || '[]');
  
  if (currentMode === 'register') {
    const name = formData.get('name');
    const passwordConfirm = formData.get('password_confirm');
    
    if (!name?.trim()) {
      alert('Введите ваше имя!');
      return;
    }
    
    if (password !== passwordConfirm) {
      alert('Пароли не совпадают!');
      return;
    }
    
    if (password.length < 6) {
      alert('Пароль должен содержать минимум 6 символов!');
      return;
    }
    
    if (existingUsers.find(user => user.email === email)) {
      alert('Пользователь с таким email уже зарегистрирован! Войдите в аккаунт.');
      toggleButtons[1].click();
      return;
    }
    
    const userData = {
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString(),
      bonuses: 0
    };
    
    existingUsers.push(userData);
    localStorage.setItem('eclipseUsers', JSON.stringify(existingUsers));
    localStorage.setItem('eclipseCurrentUser', JSON.stringify({ email, name }));
    
    alert('Регистрация успешна!');
    window.location.href = getBasePath() + 'profile.html';
  } else {
    const user = existingUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      alert('Неверный email или пароль!');
      return;
    }
    
    localStorage.setItem('eclipseCurrentUser', JSON.stringify({ email: user.email, name: user.name }));
    alert('Вход выполнен успешно!');
    window.location.href = getBasePath() + 'profile.html';
  }
});
