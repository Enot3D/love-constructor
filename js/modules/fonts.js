/* ============================================================
   МОДУЛЬ: ШРИФТЫ
   ============================================================ */
const FontsModule = {
  init() {
    bindField('#fontFamily', 'fontFamily');
    bindRange('#fontSize', 'fontSize', '#fontSizeVal');
    bindField('#fontWeight', 'fontWeight');
    bindRange('#fontSpacing', 'fontSpacing', '#fontSpacingVal');
    bindRange('#fontLine', 'fontLine', '#fontLineVal');

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
  }
};
