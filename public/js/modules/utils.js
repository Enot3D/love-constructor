/* ============================================================
   ОБЩИЕ УТИЛИТЫ ДЛЯ МОДУЛЕЙ
   Устраняет дублирование _bind / _range / _esc.
   ============================================================ */

/**
 * Привязывает input/select к ключу состояния.
 * @param {string} sel — CSS-селектор элемента
 * @param {string} key — ключ AppState
 * @param {Object} [opts]
 * @param {boolean} [opts.changeOnly=false] — слушать только 'change'
 */
function bindField(sel, key, opts) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.value = AppState[key] ?? '';
  const handler = () => setState(key, el.value);
  if (opts && opts.changeOnly) {
    el.addEventListener('change', handler);
  } else {
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  }
}

/**
 * Привязывает range-поле + отображает текущее значение.
 * @param {string} sel — селектор range
 * @param {string} key — ключ AppState
 * @param {string} valSel — селектор span со значением
 */
function bindRange(sel, key, valSel) {
  const el = document.querySelector(sel);
  const valEl = document.querySelector(valSel);
  if (!el) return;
  el.value = AppState[key];
  if (valEl) valEl.textContent = AppState[key];
  el.addEventListener('input', () => {
    const v = Number(el.value);
    setState(key, v);
    if (valEl) valEl.textContent = v;
  });
}

/**
 * Экранирование HTML-спецсимволов.
 */
function escHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
