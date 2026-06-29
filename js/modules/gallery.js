/* ============================================================
   МОДУЛЬ: ГАЛЕРЕЯ
   Режимы отображения фото: сетка, карусель, слайдер.
   ============================================================ */
const GalleryModule = {
  init() {
    this._bind('#galleryMode', 'galleryMode');
    this._bind('#galleryAuto', 'galleryAuto');
    this._range('#galleryInterval', 'galleryInterval', '#galleryIntervalVal');
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
