/* ============================================================
   МОДУЛЬ: ОСНОВНОЙ ТЕКСТ
   Привязка полей ввода к состоянию.
   ============================================================ */
const TextModule = {
  init() {
    const fields = [
      { el: '#pageTitle',    key: 'pageTitle' },
      { el: '#mainTitle',    key: 'mainTitle' },
      { el: '#mainText',     key: 'mainText' },
      { el: '#yesText',      key: 'yesText' },
      { el: '#mainSignature', key: 'mainSignature' },
      { el: '#mainDate',     key: 'mainDate' },
      { el: '#mainPlace',    key: 'mainPlace' },
      { el: '#girlName',     key: 'girlName' },
      { el: '#senderName',   key: 'senderName' },
    ];

    fields.forEach(({ el, key }) => {
      const input = document.querySelector(el);
      if (!input) return;
      input.value = AppState[key];
      input.addEventListener('input', () => setState(key, input.value));
    });
  }
};
