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

    /* Цвет кнопок — обновляет обе кнопки сразу */
    const btnColorInput = document.querySelector('#colorButtons');
    if (btnColorInput) {
      btnColorInput.value = AppState.btnYesColor;
      btnColorInput.addEventListener('input', () => {
        batchSetState({
          btnYesColor: btnColorInput.value,
          btnNoColor: btnColorInput.value
        });
        /* Обновляем поля в секции «Кнопки» */
        const yesEl = document.querySelector('#btnYesColor');
        const noEl = document.querySelector('#btnNoColor');
        if (yesEl) yesEl.value = btnColorInput.value;
        if (noEl) noEl.value = btnColorInput.value;
      });
    }
  }
};
