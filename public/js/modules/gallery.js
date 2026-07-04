/* ============================================================
   МОДУЛЬ: ГАЛЕРЕЯ
   ============================================================ */
const GalleryModule = {
  init() {
    bindField('#galleryMode', 'galleryMode', { changeOnly: true });
    bindField('#galleryAuto', 'galleryAuto', { changeOnly: true });
    bindRange('#galleryInterval', 'galleryInterval', '#galleryIntervalVal');
  }
};
