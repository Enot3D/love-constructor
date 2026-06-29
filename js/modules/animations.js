/* ============================================================
   МОДУЛЬ: АНИМАЦИИ ФОНА
   Падающие сердечки, лепестки, снежинки и т.д.
   ============================================================ */
const AnimationsModule = {
  init() {
    this._bind('#animType', 'animType');
    this._range('#animCount', 'animCount', '#animCountVal');
    this._range('#animSpeed', 'animSpeed', '#animSpeedVal');
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
