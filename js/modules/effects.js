/* ============================================================
   МОДУЛЬ: ЭФФЕКТЫ
   ============================================================ */
const EffectsModule = {
  init() {
    bindField('#fxTyping', 'fxTyping', { changeOnly: true });
    bindField('#fxEntrance', 'fxEntrance', { changeOnly: true });
    bindField('#fxSmoothScroll', 'fxSmoothScroll', { changeOnly: true });
    bindField('#fxParallax', 'fxParallax', { changeOnly: true });
  }
};
