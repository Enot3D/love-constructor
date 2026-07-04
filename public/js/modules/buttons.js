/* ============================================================
   МОДУЛЬ: КНОПКИ
   ============================================================ */
const ButtonsModule = {
  init() {
    bindField('#btnYesText', 'btnYesText');
    bindField('#btnNoText', 'btnNoText');
    bindRange('#btnSize', 'btnSize', '#btnSizeVal');
    bindRange('#btnRadius', 'btnRadius', '#btnRadiusVal');
    bindField('#btnYesColor', 'btnYesColor');
    bindField('#btnNoColor', 'btnNoColor');
    bindField('#btnFont', 'btnFont');
    bindField('#btnShadow', 'btnShadow');
    bindField('#btnHover', 'btnHover');
    bindField('#btnAnimIn', 'btnAnimIn');
  }
};
