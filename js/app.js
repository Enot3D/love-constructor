/* ============================================================
   ГЛАВНЫЙ МОДУЛЬ ПРИЛОЖЕНИЯ (APP)
   Инициализация всех модулей, навигация, ресайзер,
   автосохранение, горячие клавиши.
   ============================================================ */
const App = {
  init() {
    /* --- Загрузка сохранённого проекта --- */
    loadProject();

    /* --- Инициализация всех модулей --- */
    TextModule.init();
    ButtonsModule.init();
    BackgroundModule.init();
    FontsModule.init();
    AnimationsModule.init();
    PhotosModule.init();
    MusicModule.init();
    ThemesModule.init();
    GalleryModule.init();
    TimerModule.init();
    ColorsModule.init();
    EffectsModule.init();
    MessagesModule.init();
    YesActionModule.init();
    NoBehaviorModule.init();
    SvgModule.init();
    DecorationsModule.init();

    /* --- Навигация по секциям --- */
    this._initNav();

    /* --- Ресайзер панели --- */
    this._initResizer();

    /* --- Кнопки тулбара --- */
    this._initToolbar();

    /* --- Полноэкранный предпросмотр --- */
    this._initFullscreen();

    /* --- Автосохранение каждые 30 сек --- */
    setInterval(() => saveProject(), 30000);

    /* --- Сохранение при уходе --- */
    window.addEventListener('beforeunload', () => saveProject());

    /* --- Инициализация предпросмотра (последним) --- */
    Preview.init();
  },

  /* ========================================================
     НАВИГАЦИЯ ПО СЕКЦИЯМ
     ======================================================== */
  _initNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.settings-panel');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;

        /* Обновляем активную кнопку */
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        /* Показываем нужную панель */
        panels.forEach(p => p.classList.remove('active'));
        const target = document.querySelector(`[data-panel="${section}"]`);
        if (target) target.classList.add('active');
      });
    });
  },

  /* ========================================================
     РЕСАЙЗЕР ПАНЕЛИ
     ======================================================== */
  _initResizer() {
    const resizer = document.querySelector('#resizer');
    const sidebar = document.querySelector('#sidebar');
    if (!resizer || !sidebar) return;

    let isResizing = false;
    let startX, startWidth;

    resizer.addEventListener('mousedown', e => {
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      resizer.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(280, Math.min(600, startWidth + diff));
      sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  },

  /* ========================================================
     КНОПКИ ТУЛБАРА
     ======================================================== */
  _initToolbar() {
    /* Новый проект */
    const btnNew = document.querySelector('#btnNewProject');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        if (confirm('Создать новый проект? Несохранённые изменения будут потеряны.')) {
          resetProject();
          /* Обновляем все поля ввода */
          setTimeout(() => {
            TextModule.init();
            ButtonsModule.init();
            BackgroundModule.init();
            ColorsModule.init();
            MusicModule._updateInfo();
            PhotosModule._renderGrid();
            MessagesModule._render();
            ThemesModule._render();
          }, 50);
        }
      });
    }

    /* Сохранить */
    const btnSave = document.querySelector('#btnSave');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        saveProject();
        this._showToast('Проект сохранён!');
      });
    }

    /* Загрузить */
    const btnLoad = document.querySelector('#btnLoad');
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        if (loadProject()) {
          /* Обновляем UI */
          setTimeout(() => {
            TextModule.init();
            ButtonsModule.init();
            BackgroundModule.init();
            ColorsModule.init();
            FontsModule.init();
            MusicModule._updateInfo();
            PhotosModule._renderGrid();
            MessagesModule._render();
            ThemesModule._render();
          }, 50);
          this._showToast('Проект загружен!');
        } else {
          this._showToast('Нет сохранённого проекта');
        }
      });
    }

    /* Экспорт */
    const btnExport = document.querySelector('#btnExport');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        ExportModule.exportSingleFile();
        this._showToast('Сайт экспортирован!');
      });
    }

    /* Импорт */
    const btnImport = document.querySelector('#btnImport');
    const importInput = document.querySelector('#importInput');
    if (btnImport && importInput) {
      btnImport.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', () => {
        if (importInput.files[0]) {
          ExportModule.importJSON(importInput.files[0]);
          setTimeout(() => {
            TextModule.init();
            ButtonsModule.init();
            BackgroundModule.init();
            ColorsModule.init();
            FontsModule.init();
            MusicModule._updateInfo();
            PhotosModule._renderGrid();
            MessagesModule._render();
            ThemesModule._render();
          }, 100);
          this._showToast('Проект импортирован!');
        }
      });
    }

    /* Опубликовать */
    const btnPublish = document.querySelector('#btnPublish');
    if (btnPublish) {
      btnPublish.addEventListener('click', async () => {
        btnPublish.disabled = true;
        btnPublish.querySelector('span').textContent = 'Публикация...';
        this._showToast('Публикация...');

        const link = await ExportModule.publish();

        btnPublish.disabled = false;
        btnPublish.querySelector('span').textContent = 'Опубликовать';

        if (link) {
          this._showLinkModal(link);
        }
      });
    }
  },

  /* ========================================================
     ПОЛНОЭКРАННЫЙ ПРЕДПРОСМОТР
     ======================================================== */
  _initFullscreen() {
    const btn = document.querySelector('#btnPreviewFull');
    const overlay = document.querySelector('#fullscreenPreview');
    const closeBtn = document.querySelector('#fullscreenClose');
    const fsIframe = document.querySelector('#fullscreenIframe');

    if (btn && overlay && fsIframe) {
      btn.addEventListener('click', () => {
        const html = Preview.generateHTML(true);
        overlay.style.display = 'block';
        fsIframe.removeAttribute('sandbox');
        const blob = new Blob([html], { type: 'text/html' });
        fsIframe.src = URL.createObjectURL(blob);
      });
    }

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
      });
    }

    /* Закрытие по Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') {
        overlay.style.display = 'none';
      }
    });
  },

  /* ========================================================
     TOAST-УВЕДОМЛЕНИЕ
     ======================================================== */
  _showToast(msg) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        padding: 10px 24px; background: #333; color: #fff; border-radius: 8px;
        font-size: 13px; font-family: var(--font); z-index: 9999;
        opacity: 0; transition: opacity 0.3s; pointer-events: none;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  },

  /* ========================================================
     МОДАЛЬНОЕ ОКНО С СЫЛКОЙ
     ======================================================== */
  _showLinkModal(link) {
    /* Удаляем старое модальное окно если есть */
    const old = document.querySelector('.link-modal-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'link-modal-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #fff; border-radius: 20px; padding: 32px;
      max-width: 520px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center; animation: slideUp 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
      <h2 style="margin: 0 0 8px; font-size: 20px; color: #1d1d1f;">Приглашение опубликовано!</h2>
      <p style="margin: 0 0 16px; color: #6e6e73; font-size: 14px;">Отправьте эту ссылку девушке:</p>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input type="text" value="${link}" readonly id="linkInput"
          style="flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 10px;
          font-size: 14px; font-family: monospace; background: #f5f5f5; outline: none;">
        <button id="copyLinkBtn"
          style="padding: 12px 20px; background: #e91e63; color: #fff; border: none;
          border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
          transition: background 0.2s; white-space: nowrap;">
          Копировать
        </button>
      </div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <a href="${link}" target="_blank"
          style="padding: 10px 20px; background: #f5f5f5; color: #333; border: none;
          border-radius: 10px; font-size: 13px; cursor: pointer; text-decoration: none;">
          Открыть приглашение
        </a>
        <button id="closeModalBtn"
          style="padding: 10px 20px; background: transparent; color: #6e6e73; border: 1px solid #e0e0e0;
          border-radius: 10px; font-size: 13px; cursor: pointer;">
          Закрыть
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    /* Копирование ссылки */
    modal.querySelector('#copyLinkBtn').addEventListener('click', () => {
      const input = modal.querySelector('#linkInput');
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        modal.querySelector('#copyLinkBtn').textContent = 'Скопировано!';
        setTimeout(() => { modal.querySelector('#copyLinkBtn').textContent = 'Копировать'; }, 2000);
      }).catch(() => {
        document.execCommand('copy');
        modal.querySelector('#copyLinkBtn').textContent = 'Скопировано!';
      });
    });

    /* Закрытие */
    modal.querySelector('#closeModalBtn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
};

/* ============================================================
   ЗАПУСК ПРИЛОЖЕНИЯ
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
