/* ============================================================
   МОДУЛЬ: ФОТО
   Загрузка, превью, сортировка и настройка фотографий.
   ============================================================ */
const PhotosModule = {
  _dragIdx: null,

  init() {
    /* Drag & Drop загрузка */
    const dz = document.querySelector('#photoDropzone');
    const fi = document.querySelector('#photoInput');

    if (dz) {
      dz.addEventListener('click', () => fi && fi.click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        this._handleFiles(e.dataTransfer.files);
      });
    }
    if (fi) {
      fi.addEventListener('change', () => this._handleFiles(fi.files));
    }

    /* Настройки фото */
    this._range('#photoRadius', 'photoRadius', '#photoRadiusVal');
    this._bind('#photoBorderColor', 'photoBorderColor');
    this._range('#photoBorder', 'photoBorder', '#photoBorderVal');
    this._bind('#photoShadow', 'photoShadow');
    this._range('#photoSize', 'photoSize', '#photoSizeVal');
    this._range('#photoOpacity', 'photoOpacity', '#photoOpacityVal');
  },

  _handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        AppState.photos.push({
          id: uid(),
          dataUrl: e.target.result,
          isMain: AppState.photos.length === 0
        });
        setState('photos', [...AppState.photos]);
        this._renderGrid();
      };
      reader.readAsDataURL(file);
    });
  },

  _renderGrid() {
    const grid = document.querySelector('#photoGrid');
    if (!grid) return;
    grid.innerHTML = AppState.photos.map((p, i) => `
      <div class="photo-thumb ${p.isMain ? 'main' : ''}" draggable="true" data-idx="${i}" title="${p.isMain ? 'Главное фото' : 'Нажмите ☆ чтобы сделать главным'}">
        <img src="${p.dataUrl}" alt="Фото ${i + 1}">
        <div class="photo-actions">
          <button data-action="main" title="Сделать главным">☆</button>
          <button data-action="delete" title="Удалить">×</button>
        </div>
      </div>
    `).join('');

    /* Обработчики */
    grid.querySelectorAll('.photo-thumb').forEach(thumb => {
      const idx = Number(thumb.dataset.idx);

      /* Сделать главным */
      thumb.querySelector('[data-action="main"]').addEventListener('click', e => {
        e.stopPropagation();
        AppState.photos.forEach((p, i) => p.isMain = i === idx);
        setState('photos', [...AppState.photos]);
        this._renderGrid();
      });

      /* Удалить */
      thumb.querySelector('[data-action="delete"]').addEventListener('click', e => {
        e.stopPropagation();
        AppState.photos.splice(idx, 1);
        if (AppState.photos.length && !AppState.photos.some(p => p.isMain)) {
          AppState.photos[0].isMain = true;
        }
        setState('photos', [...AppState.photos]);
        this._renderGrid();
      });

      /* Drag для сортировки */
      thumb.addEventListener('dragstart', e => {
        this._dragIdx = idx;
        e.dataTransfer.effectAllowed = 'move';
      });
      thumb.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      thumb.addEventListener('drop', e => {
        e.preventDefault();
        const toIdx = idx;
        if (this._dragIdx !== null && this._dragIdx !== toIdx) {
          const [moved] = AppState.photos.splice(this._dragIdx, 1);
          AppState.photos.splice(toIdx, 0, moved);
          setState('photos', [...AppState.photos]);
          this._renderGrid();
        }
        this._dragIdx = null;
      });
    });
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key];
    el.addEventListener('input', () => setState(key, el.value));
    el.addEventListener('change', () => setState(key, el.value));
  },

  _range(sel, key, valSel) {
    const el = document.querySelector(sel);
    const valEl = document.querySelector(valSel);
    if (!el) return;
    el.value = AppState[key];
    if (valEl) valEl.textContent = AppState[key];
    el.addEventListener('input', () => {
      setState(key, Number(el.value));
      if (valEl) valEl.textContent = el.value;
    });
  }
};
