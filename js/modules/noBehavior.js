/* ============================================================
   МОДУЛЬ: ПОВЕДЕНИЕ КНОПКИ «НЕТ»
   Настройка режима избегания, телепортации и т.д.
   ============================================================ */
const NoBehaviorModule = {
  init() {
    this._bind('#noMode', 'noMode');
    this._range('#noSpeed', 'noSpeed', '#noSpeedVal');
    this._range('#noChance', 'noChance', '#noChanceVal');
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
