/* ============================================================
   МОДУЛЬ: ПОВЕДЕНИЕ КНОПКИ «НЕТ»
   ============================================================ */
const NoBehaviorModule = {
  init() {
    bindField('#noMode', 'noMode', { changeOnly: true });
    bindRange('#noSpeed', 'noSpeed', '#noSpeedVal');
    bindRange('#noChance', 'noChance', '#noChanceVal');
  }
};
