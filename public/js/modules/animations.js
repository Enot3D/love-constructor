/* ============================================================
   МОДУЛЬ: АНИМАЦИИ ФОНА
   ============================================================ */
const AnimationsModule = {
  init() {
    bindField('#animType', 'animType', { changeOnly: true });
    bindRange('#animCount', 'animCount', '#animCountVal');
    bindRange('#animSpeed', 'animSpeed', '#animSpeedVal');
  }
};
