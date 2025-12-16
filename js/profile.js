function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '' : 'pages/';
}

function checkAuth() {
  const currentUser = localStorage.getItem('eclipseCurrentUser');
  if (!currentUser) {
    window.location.href = getBasePath() + 'register.html';
    return null;
  }
  return JSON.parse(currentUser);
}

function loadUserData() {
  const user = checkAuth();
  if (!user) return;
  
  document.getElementById('userName').textContent = user.name || 'Пользователь';
  const emailSpan = document.querySelector('#userEmail span');
  if (emailSpan) emailSpan.textContent = user.email || '';
  
  const avatar = document.getElementById('userAvatar');
  if (avatar && user.name) avatar.textContent = user.name.charAt(0).toUpperCase();
  
  const users = JSON.parse(localStorage.getItem('eclipseUsers') || '[]');
  const fullUserData = users.find(u => u.email === user.email);
  
  if (!fullUserData) {
    document.getElementById('profileContent').innerHTML = `
      <div class="empty-state">
        <h2>Данные не найдены</h2>
        <p>Произошла ошибка при загрузке данных профиля</p>
      </div>
    `;
    return;
  }
  
  const formattedDate = new Date(fullUserData.registeredAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  document.getElementById('profileContent').innerHTML = `
    <div class="profile-card">
      <div class="profile-card__header">
        <div class="profile-card__icon"><i class="fa-solid fa-user"></i></div>
        <h2>Мои данные</h2>
      </div>
      <div class="profile-info">
        <div class="profile-info-item">
          <span class="profile-info-label">Имя</span>
          <span class="profile-info-value">${fullUserData.name}</span>
        </div>
        <div class="profile-info-item">
          <span class="profile-info-label">Email</span>
          <span class="profile-info-value">${fullUserData.email}</span>
        </div>
        <div class="profile-info-item">
          <span class="profile-info-label">Дата регистрации</span>
          <span class="profile-info-value">${formattedDate}</span>
        </div>
      </div>
    </div>
    <div class="profile-card">
      <div class="profile-card__header">
        <div class="profile-card__icon"><i class="fa-solid fa-gift"></i></div>
        <h2>Бонусы</h2>
      </div>
      <div class="bonuses-display">
        <div class="bonuses-amount">${fullUserData.bonuses || 0}</div>
        <div class="bonuses-label">БОНУСНЫХ БАЛЛОВ</div>
      </div>
    </div>
    <div class="profile-card">
      <div class="profile-card__header">
        <div class="profile-card__icon"><i class="fa-solid fa-bolt"></i></div>
        <h2>Быстрые действия</h2>
      </div>
      <div class="action-buttons">
        <a href="../index.html" class="action-btn action-btn--primary">
          <i class="fa-solid fa-store"></i> Каталог
        </a>
        <button class="logout-btn" id="logoutBtn">
          <i class="fa-solid fa-right-from-bracket"></i> Выйти
        </button>
      </div>
    </div>
  `;
  
  document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      localStorage.removeItem('eclipseCurrentUser');
      window.location.href = getBasePath() + 'register.html';
    }
  });
}

loadUserData();
