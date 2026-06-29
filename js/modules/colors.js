/* ============================================================
   МОДУЛЬ: ЦВЕТОВАЯ СХЕМА
   Настройка основных цветов страницы.
   ============================================================ */
const ColorsModule = {
  init() {
    const fields = [
      { el: '#colorPrimary', key: 'colorPrimary' },
      { el: '#colorAccent',  key: 'colorAccent' },
      { el: '#colorBg',      key: 'colorBg' },
      { el: '#colorButtons', key: 'colorButtons' },
      { el: '#colorText',    key: 'colorText' },
      { el: '#colorBorder',  key: 'colorBorder' },
      { el: '#colorShadow',  key: 'colorShadow' },
    ];

    fields.forEach(({ el, key }) => {
      const input = document.querySelector(el);
      if (!input) return;
      input.value = AppState[key];
      input.addEventListener('input', () => setState(key, input.value));
    });
  }
};
