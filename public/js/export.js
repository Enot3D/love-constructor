/* ============================================================
   МОДУЛЬ: ЭКСПОРТ
   Экспорт в файл, публикация, импорт/экспорт JSON.
   ============================================================ */
const ExportModule = {

  /* ---- Экспорт в один HTML-файл ---- */
  exportSingleFile() {
    const html = Preview.generateHTML(true);
    this._download(html, 'invitation.html', 'text/html');
  },

  /* ---- Экспорт проекта в JSON ---- */
  exportJSON() {
    const data = {};
    for (const key in AppState) {
      if (AppState[key] !== null && AppState[key] !== undefined) {
        data[key] = AppState[key];
      }
    }
    const json = JSON.stringify(data, null, 2);
    this._download(json, 'project.json', 'application/json');
  },

  /* ---- Импорт проекта из JSON ---- */
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        Object.assign(AppState, data);
        notify();
      } catch (err) {
        alert('Ошибка при импорте: неверный формат файла');
      }
    };
    reader.readAsText(file);
  },

  /* ============================================================
     ПУБЛИКАЦИЯ ПРИГЛАШЕНИЯ
     Сохраняет готовый HTML через API и возвращает ссылку.
     ============================================================ */
  async publish() {
    /* Проверяем авторизацию */
    try {
      const authResp = await fetch('/api/auth/me', { credentials: 'include' });
      if (!authResp.ok) {
        window.location.href = '/login';
        return null;
      }
    } catch (e) {
      window.location.href = '/login';
      return null;
    }

    try {
      /* Генерируем HTML приглашения */
      const html = Preview.generateHTML(true);

      /* Отправляем на сервер */
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ html, title: AppState.pageTitle, girlName: AppState.girlName || '' })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка сервера');
      }

      const result = await response.json();

      /* Сохраняем ID приглашения */
      setState('publishedId', result.id);
      ResponsesModule.setInviteId(result.id);

      return { inviteLink: result.inviteLink, trackerLink: result.trackerLink };

    } catch (e) {
      console.error('Ошибка публикации:', e);
      alert('Не удалось опубликовать: ' + e.message);
      return null;
    }
  },

  /* ---- Генерация короткого уникального ID ---- */
  _generateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /* ---- Скачивание файла ---- */
  _download(content, filename, mime) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
