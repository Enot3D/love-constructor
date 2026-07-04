/* ============================================================
   МОДУЛЬ: ОТВЕТЫ
   Загрузка и отображение ответов девушек.
   ============================================================ */
const ResponsesModule = {
  init() {
    if (AppState.publishedId) {
      const el = document.querySelector('#responseInviteId');
      if (el) el.value = AppState.publishedId;
    }
  },

  setInviteId(id) {
    AppState.publishedId = id;
    const el = document.querySelector('#responseInviteId');
    if (el) el.value = id;
  },

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
      const resp = await fetch('/api/invitations/' + id + '/public');
      if (!resp.ok) throw new Error('Ошибка загрузки');
      container.innerHTML = '<p class="panel-desc">Пока нет ответов. Отправьте ссылку девушке и подождите.</p>';
    } catch (e) {
      container.innerHTML = '<p class="panel-desc" style="color:#e53935;">Ошибка загрузки: ' + e.message + '</p>';
    }
  },

  _showMessage(msg) {
    const container = document.querySelector('#responsesList');
    if (container) container.innerHTML = '<p class="panel-desc">' + msg + '</p>';
  }
};
