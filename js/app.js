/* =========================================================
   1. ТЕМА (работает на всех страницах)
   ========================================================= */
(function initTheme() {
  const KEY = 'flora-theme';
  const btn = document.getElementById('themeToggle');

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      apply(current === 'dark' ? 'light' : 'dark');
    });
  }

  apply(document.documentElement.getAttribute('data-theme') || 'light');
})();


/* =========================================================
   2. ТОСТ
   ========================================================= */
function showToast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 320);
  }, 2600);
}


/* =========================================================
   3. ГЛАВНЫЙ ЧАТ (index.html)
   ========================================================= */
(function initChat() {
  const listEl = document.getElementById('chatList');
  if (!listEl) return;

  const messagesEl = document.getElementById('messages');
  const form       = document.getElementById('composerForm');
  const input      = document.getElementById('composerInput');
  const newChatBtn = document.getElementById('newChatBtn');

  /* ---- демо-данные ---- */
  const chats = [
    {
      id: 1,
      title: 'Растение похоже на те...',
      time: '12:04',
      messages: [
        { from: 'user', text: 'Растение похоже на те, что растут у меня на даче. Что это может быть?' },
        { from: 'bot',  text: 'Опишите, пожалуйста, подробнее: форма листьев, высота, есть ли цветы и какого они цвета.' }
      ]
    },
    {
      id: 2,
      title: 'Трава найденна на поле...',
      time: 'Вчера',
      messages: [
        { from: 'user', text: 'Трава найдена на поле возле леса, узкие длинные листья.' }
      ]
    },
    {
      id: 3,
      title: 'Листья с зубчатым краем',
      time: 'Пн',
      messages: []
    }
  ];

  let activeId = 1;
  let nextId   = 4;

  const BOT_REPLIES = [
    'Спасибо! Уточните, пожалуйста, где растёт это растение — в тени или на солнце?',
    'Понял вас. А какого размера листья: крупные или мелкие?',
    'Интересно! Есть ли на растении цветы или плоды?',
    'Спасибо за описание. Судя по признакам, это может быть несколько видов — уточните форму стебля.',
    'Записал. Можете прислать фото — так я определю точнее.'
  ];
  let replyIdx = 0;

  /* ---- отрисовка списка чатов ---- */
  function renderList() {
    listEl.innerHTML = '';
    chats.forEach((chat, i) => {
      const li = document.createElement('li');
      li.className = 'chat-item' + (chat.id === activeId ? ' active' : '');
      li.style.animationDelay = (i * 40) + 'ms';
      li.innerHTML =
        `<span class="chat-item-title">${escapeHtml(chat.title)}</span>` +
        `<span class="chat-item-time">${escapeHtml(chat.time)}</span>`;

      li.addEventListener('click', () => {
        activeId = chat.id;
        renderList();
        renderMessages();
      });

      listEl.appendChild(li);
    });
  }

  /* ---- отрисовка сообщений ---- */
  function renderMessages() {
    const chat = chats.find(c => c.id === activeId);
    messagesEl.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
      messagesEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🌿</div>
          <h2>О каком растении хотите узнать?</h2>
          <p>Опишите его словами или задайте вопрос — я помогу определить вид.</p>
        </div>`;
      return;
    }

    chat.messages.forEach(m => addBubble(m.from, m.text, false));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ---- добавить "пузырь" сообщения ---- */
  function addBubble(from, text, animate = true) {
    const emptyState = messagesEl.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = 'msg ' + from;
    div.textContent = text;
    if (!animate) div.style.animation = 'none';

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ---- отправка сообщения ---- */
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const chat = chats.find(c => c.id === activeId);

    // если чат был пустой — переименовываем его по первому сообщению
    if (chat.messages.length === 0) {
      chat.title = text.length > 26 ? text.slice(0, 26) + '...' : text;
      chat.time  = 'Сейчас';
      renderList();
    }

    chat.messages.push({ from: 'user', text });
    addBubble('user', text);
    input.value = '';
    input.focus();

    // имитация ответа "бота"
    setTimeout(() => {
      const reply = BOT_REPLIES[replyIdx++ % BOT_REPLIES.length];
      chat.messages.push({ from: 'bot', text: reply });
      addBubble('bot', reply);
    }, 700);
  });

  /* ---- новый чат ---- */
  newChatBtn.addEventListener('click', () => {
    const id = nextId++;
    chats.unshift({ id, title: 'Новый чат', time: 'Сейчас', messages: [] });
    activeId = id;
    renderList();
    renderMessages();
    input.focus();
  });

  /* ---- утилита защиты от HTML-инъекций ---- */
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  /* ---- старт ---- */
  renderList();
  renderMessages();
  input.focus();
})();


/* =========================================================
   4. ВАЛИДАЦИЯ ФОРМ (register.html / login.html)
   ========================================================= */

/* правила из ТЗ */
const RULES = {
  name: {
    test(v) {
      const errors = [];
      if (v.length < 3 || v.length > 30)
        errors.push('Имя должно содержать от 3 до 30 символов.');
      if (v && !/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]*$/.test(v))
        errors.push('Имя должно содержать только буквы, пробел, дефис или апостроф.');
      return errors;
    }
  },
  login: {
    test(v) {
      const errors = [];
      if (v.length < 3 || v.length > 30)
        errors.push('Логин должен содержать от 3 до 30 символов.');
      if (v && !/^[A-Za-z0-9_-]+$/.test(v))
        errors.push('Логин должен содержать только латинские буквы, цифры, дефис или подчеркивание.');
      return errors;
    }
  },
  password: {
    test(v) {
      const errors = [];
      if (v.length < 5 || v.length > 20)
        errors.push('Пароль должен содержать от 5 до 20 символов.');
      if (v && !/^[A-Za-z0-9]+$/.test(v))
        errors.push('Пароль должен содержать только цифры и латинские буквы.');
      return errors;
    }
  }
};

/* навешиваем валидацию на форму, если она есть на странице */
(function initForms() {

  function setupForm(formId, onSuccess) {
    const form = document.getElementById(formId);
    if (!form) return;

    const fields = form.querySelectorAll('.field');

    fields.forEach(field => {
      const key   = field.dataset.field;
      const input = field.querySelector('input');
      if (!input || !RULES[key]) return;

      // живая перепроверка после первой неудачной попытки
      input.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field, true);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;

      fields.forEach(field => {
        if (!validateField(field, false)) ok = false;
      });

      if (ok) onSuccess(form);
    });
  }

  function validateField(field, live) {
    const key   = field.dataset.field;
    const input = field.querySelector('input');
    const box   = field.querySelector('.error-text');
    if (!input || !RULES[key]) return true;

    const errors = RULES[key].test(input.value.trim());

    if (errors.length) {
      field.classList.add('error');
      box.innerHTML = errors.map(e => `<span>${e}</span>`).join('');
      return false;
    } else {
      field.classList.remove('error');
      box.innerHTML = '';
      return true;
    }
  }

  /* --- РЕГИСТРАЦИЯ --- */
  setupForm('registerForm', () => {
    showToast('Регистрация прошла успешно! Переходим в чат...');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  });

  /* --- ВХОД --- */
  setupForm('loginForm', () => {
    showToast('Вход выполнен! Переходим в чат...');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  });

  /* --- "забыли пароль?" --- */
  const forgot = document.getElementById('forgotLink');
  if (forgot) {
    forgot.addEventListener('click', e => {
      e.preventDefault();
      showToast('Ссылка для восстановления пароля отправлена на почту');
    });
  }

})();