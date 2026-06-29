/* ============================================================
   МОДУЛЬ: ФОН
   Управление типом фона и его параметрами.
   ============================================================ */
const BackgroundModule = {
  init() {
    const bgType = document.querySelector('#bgType');
    bgType.value = AppState.bgType;
    this._toggleGroups(AppState.bgType);

    bgType.addEventListener('change', () => {
      setState('bgType', bgType.value);
      this._toggleGroups(bgType.value);
    });

    this._bind('#bgColor', 'bgColor');
    this._bind('#bgGrad1', 'bgGrad1');
    this._bind('#bgGrad2', 'bgGrad2');
    this._bind('#bgGradDir', 'bgGradDir');
    this._bind('#bgImageUrl', 'bgImageUrl');
    this._bind('#bgVideoUrl', 'bgVideoUrl');
    this._range('#bgBlur', 'bgBlur', '#bgBlurVal');
    this._bind('#bgParallax', 'bgParallax');

    /* Загрузка фонового изображения */
    const dz = document.querySelector('#bgImageDropzone');
    const fi = document.querySelector('#bgImageInput');
    if (dz && fi) {
      dz.addEventListener('click', () => fi.click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        if (e.dataTransfer.files[0]) this._loadBgImage(e.dataTransfer.files[0]);
      });
      fi.addEventListener('change', () => {
        if (fi.files[0]) this._loadBgImage(fi.files[0]);
      });
    }
  },

  _loadBgImage(file) {
    const reader = new FileReader();
    reader.onload = e => setState('bgImageData', e.target.result);
    reader.readAsDataURL(file);
  },

  _toggleGroups(type) {
    document.querySelectorAll('.bg-solid-group').forEach(el => el.style.display = type === 'solid' ? '' : 'none');
    document.querySelectorAll('.bg-gradient-group').forEach(el => el.style.display = type === 'gradient' ? '' : 'none');
    document.querySelectorAll('.bg-image-group').forEach(el => el.style.display = (type === 'image' || type === 'gif') ? '' : 'none');
    document.querySelectorAll('.bg-video-group').forEach(el => el.style.display = type === 'video' ? '' : 'none');
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key] ?? '';
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
