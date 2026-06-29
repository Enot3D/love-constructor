/* ============================================================
   МОДУЛЬ: ЭКСПОРТ
   Экспорт в файл, публикация в Firebase, импорт/экспорт JSON.
   ============================================================ */
const ExportModule = {

  /* ============================================================
     FIREBASE CONFIGURATION
     Замените URL на ваш из Firebase Console.
     Инструкция: https://console.firebase.google.com
     ============================================================ */
  FIREBASE_URL: 'https://love-constructor-default-rtdb.firebaseio.com',

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
     Сохраняет готовый HTML в Firebase и возвращает ссылку.
     ============================================================ */
  async publish() {
    /* Проверяем, настроен ли Firebase */
    if (this.FIREBASE_URL.includes('ВАШ-ПРОЕКТ')) {
      alert(
        'Для публикации нужно настроить Firebase.\n\n' +
        '1. Создайте проект на console.firebase.google.com\n' +
        '2. Включите Realtime Database\n' +
        '3. Укажите URL в js/export.js (строка FIREBASE_URL)\n' +
        '4. Установите правила доступа на чтение/запись\n\n' +
        'Подробная инструкция в файле SETUP.md'
      );
      return null;
    }

    try {
      /* Генерируем HTML приглашения */
      const html = Preview.generateHTML(true);

      /* Создаём уникальный ID */
      const id = this._generateId();

      /* Данные для сохранения */
      const payload = {
        html: html,
        title: AppState.pageTitle,
        createdAt: new Date().toISOString()
      };

      /* Отправляем в Firebase */
      const response = await fetch(
        this.FIREBASE_URL + '/invitations/' + id + '.json',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

      /* Сохраняем ID приглашения */
      setState('publishedId', id);
      ResponsesModule.setInviteId(id);

      /* Формируем ссылку */
      const baseUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
      const link = baseUrl + 'view.html?id=' + id;

      return link;

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
