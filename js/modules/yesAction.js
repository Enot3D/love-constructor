/* ============================================================
   МОДУЛЬ: ДЕЙСТВИЯ ПОСЛЕ «ДА»
   Настройка того, что произойдёт после нажатия «Да».
   ============================================================ */
const YesActionModule = {
  init() {
    this._bind('#yesShowMsg', 'yesShowMsg');
    this._bind('#yesMusic', 'yesMusic');
    this._bind('#yesConfetti', 'yesConfetti');
    this._bind('#yesFireworks', 'yesFireworks');
    this._bind('#yesHearts', 'yesHearts');
    this._bind('#yesPhoto', 'yesPhoto');
    this._bind('#yesVideoUrl', 'yesVideoUrl');
    this._bind('#yesRedirect', 'yesRedirect');
    this._bind('#yesTimer', 'yesTimer');
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key] ?? '';
    el.addEventListener('input', () => setState(key, el.value));
    el.addEventListener('change', () => setState(key, el.value));
  }
};
