/* ============================================================
   МОДУЛЬ: ОТВЕТЫ
   Загрузка и отображение ответов девушек из Firebase.
   ============================================================ */
const ResponsesModule = {
  init() {
    /* Показываем ID если приглашение уже опубликовано */
    if (AppState.publishedId) {
      const el = document.querySelector('#responseInviteId');
      if (el) el.value = AppState.publishedId;
    }
  },

  /* Обновить ID после публикации */
  setInviteId(id) {
    AppState.publishedId = id;
    const el = document.querySelector('#responseInviteId');
    if (el) el.value = id;
  },

  /* Загрузить ответы из Firebase */
  async load() {
    const id = AppState.publishedId;
    if (!id) {
      this._showMessage('Сначала опубликуйте приглашение!');
      return;
    }

    const container = document.querySelector('#responsesList');
    if (!container) return;
    container.innerHTML = '<p class="panel-desc">Загрузка...</p>';

    try {
      const url = ExportModule.FIREBASE_URL + '/responses/' + id + '.json';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Ошибка загрузки');
      const data = await resp.json();

      if (!data) {
        container.innerHTML = '<p class="panel-desc">Пока нет ответов. Отправьте ссылку девушке и подождите.</p>';
        return;
      }

      /* Превращаем объект в массив */
      const responses = Object.values(data);

      container.innerHTML = responses.map(r => {
        const date = r.selectedDate
          ? new Date(r.selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
          : 'Не выбрана';
        const time = r.timestamp
          ? new Date(r.timestamp).toLocaleString('ru-RU')
          : '';
        const clickedYes = r.clickedYes ? '✅ Нажала «Да»' : '⏳ Ожидает ответа';
        const statusColor = r.clickedYes ? '#4caf50' : '#ff9800';

        return `
          <div class="message-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
            <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
              <strong style="color:var(--primary);font-size:14px;">📅 ${date}</strong>
              <span style="font-size:11px;color:#999;">${time}</span>
            </div>
            <span style="font-size:12px;color:${statusColor};">${clickedYes}</span>
          </div>
        `;
      }).join('');

    } catch (e) {
      container.innerHTML = '<p class="panel-desc" style="color:#e53935;">Ошибка загрузки: ' + e.message + '</p>';
    }
  },

  _showMessage(msg) {
    const container = document.querySelector('#responsesList');
    if (container) container.innerHTML = '<p class="panel-desc">' + msg + '</p>';
  }
};
