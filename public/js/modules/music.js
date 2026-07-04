/* ============================================================
   МОДУЛЬ: МУЗЫКА
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

    const rmBtn = document.querySelector('#musicRemove');
    if (rmBtn) {
      rmBtn.addEventListener('click', () => {
        setState('musicData', null);
        setState('musicName', '');
        this._updateInfo();
      });
    }

    bindField('#musicAutoplay', 'musicAutoplay', { changeOnly: true });
    bindRange('#musicVolume', 'musicVolume', '#musicVolumeVal');
    bindField('#musicLoop', 'musicLoop', { changeOnly: true });
    bindField('#musicShowControl', 'musicShowControl', { changeOnly: true });
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
  }
};
