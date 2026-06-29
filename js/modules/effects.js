/* ============================================================
   МОДУЛЬ: ЭФФЕКТЫ
   Печатающийся текст, анимации появления, параллакс.
   ============================================================ */
const EffectsModule = {
  init() {
    this._bind('#fxTyping', 'fxTyping');
    this._bind('#fxEntrance', 'fxEntrance');
    this._bind('#fxSmoothScroll', 'fxSmoothScroll');
    this._bind('#fxParallax', 'fxParallax');
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key];
    el.addEventListener('change', () => setState(key, el.value));
  }
};
