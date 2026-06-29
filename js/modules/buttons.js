/* ============================================================
   МОДУЛЬ: КНОПКИ
   Настройки внешнего вида и поведения кнопок.
   ============================================================ */
const ButtonsModule = {
  init() {
    /* Текстовые поля */
    this._bind('#btnYesText', 'btnYesText');
    this._bind('#btnNoText', 'btnNoText');

    /* Ренджи */
    this._range('#btnSize', 'btnSize', '#btnSizeVal');
    this._range('#btnRadius', 'btnRadius', '#btnRadiusVal');

    /* Цвета */
    this._bind('#btnYesColor', 'btnYesColor');
    this._bind('#btnNoColor', 'btnNoColor');

    /* Селекты */
    this._bind('#btnFont', 'btnFont');
    this._bind('#btnShadow', 'btnShadow');
    this._bind('#btnHover', 'btnHover');
    this._bind('#btnAnimIn', 'btnAnimIn');
  },

  /* Привязка input/select к ключу состояния */
  _bind(selector, key) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.value = AppState[key];
    el.addEventListener('input', () => setState(key, el.value));
    el.addEventListener('change', () => setState(key, el.value));
  },

  /* Привязка range + отображение значения */
  _range(selector, key, valSelector) {
    const el = document.querySelector(selector);
    const valEl = document.querySelector(valSelector);
    if (!el) return;
    el.value = AppState[key];
    if (valEl) valEl.textContent = AppState[key];
    el.addEventListener('input', () => {
      const v = Number(el.value);
      setState(key, v);
      if (valEl) valEl.textContent = v;
    });
  }
};
