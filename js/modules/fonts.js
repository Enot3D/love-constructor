/* ============================================================
   МОДУЛЬ: ШРИФТЫ
   Настройка типографики.
   ============================================================ */
const FontsModule = {
  init() {
    this._bind('#fontFamily', 'fontFamily');
    this._range('#fontSize', 'fontSize', '#fontSizeVal');
    this._bind('#fontWeight', 'fontWeight');
    this._range('#fontSpacing', 'fontSpacing', '#fontSpacingVal');
    this._range('#fontLine', 'fontLine', '#fontLineVal');

    /* Добавление пользовательских Google Fonts */
    const btnAdd = document.querySelector('#btnAddFont');
    const nameInput = document.querySelector('#customFontName');
    if (btnAdd && nameInput) {
      btnAdd.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name || AppState.customFonts.includes(name)) return;
        AppState.customFonts.push(name);
        setState('customFonts', [...AppState.customFonts]);
        nameInput.value = '';
        this._renderCustomFonts();
        /* Загружаем шрифт динамически */
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      });
    }
    this._renderCustomFonts();
  },

  _renderCustomFonts() {
    const container = document.querySelector('#customFontsList');
    if (!container) return;
    container.innerHTML = AppState.customFonts.map(f =>
      `<span class="tag">${f}<button data-font="${f}">×</button></span>`
    ).join('');
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        AppState.customFonts = AppState.customFonts.filter(f => f !== btn.dataset.font);
        setState('customFonts', [...AppState.customFonts]);
        this._renderCustomFonts();
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
      const v = Number(el.value);
      setState(key, v);
      if (valEl) valEl.textContent = v;
    });
  }
};
