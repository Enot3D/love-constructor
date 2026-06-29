/* ============================================================
   МОДУЛЬ: МУЗЫКА
   Загрузка MP3 и управление воспроизведением.
   ============================================================ */
const MusicModule = {
  init() {
    const dz = document.querySelector('#musicDropzone');
    const fi = document.querySelector('#musicInput');

    if (dz) {
      dz.addEventListener('click', () => fi && fi.click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) this._load(file);
      });
    }
    if (fi) {
      fi.addEventListener('change', () => {
        if (fi.files[0]) this._load(fi.files[0]);
      });
    }

    /* Удаление */
    const rmBtn = document.querySelector('#musicRemove');
    if (rmBtn) {
      rmBtn.addEventListener('click', () => {
        setState('musicData', null);
        setState('musicName', '');
        this._updateInfo();
      });
    }

    /* Настройки */
    this._bind('#musicAutoplay', 'musicAutoplay');
    this._range('#musicVolume', 'musicVolume', '#musicVolumeVal');
    this._bind('#musicLoop', 'musicLoop');
    this._bind('#musicShowControl', 'musicShowControl');
  },

  _load(file) {
    const reader = new FileReader();
    reader.onload = e => {
      setState('musicData', e.target.result);
      setState('musicName', file.name);
      this._updateInfo();
    };
    reader.readAsDataURL(file);
  },

  _updateInfo() {
    const info = document.querySelector('#musicInfo');
    const nameEl = document.querySelector('#musicName');
    const dz = document.querySelector('#musicDropzone');
    if (AppState.musicData) {
      if (info) info.style.display = 'flex';
      if (nameEl) nameEl.textContent = AppState.musicName;
      if (dz) dz.style.display = 'none';
    } else {
      if (info) info.style.display = 'none';
      if (dz) dz.style.display = '';
    }
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key];
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
