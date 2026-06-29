/* ============================================================
   МОДУЛЬ: ТАЙМЕР
   Обратный отсчёт до даты/события.
   ============================================================ */
const TimerModule = {
  init() {
    this._bind('#timerType', 'timerType');
    this._bind('#timerDate', 'timerDate');
    this._bind('#timerEvent', 'timerEvent');
    this._range('#timerSize', 'timerSize', '#timerSizeVal');

    const typeEl = document.querySelector('#timerType');
    if (typeEl) {
      typeEl.addEventListener('change', () => this._toggleGroups(typeEl.value));
      this._toggleGroups(typeEl.value);
    }
  },

  _toggleGroups(type) {
    const d = document.querySelector('.timer-date-group');
    const e = document.querySelector('.timer-event-group');
    if (d) d.style.display = type === 'date' || type === 'event' ? '' : 'none';
    if (e) e.style.display = type === 'event' ? '' : 'none';
  },

  _bind(sel, key) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = AppState[key] ?? '';
    el.addEventListener('input', () => setState(key, el.value));
    el.addEventListener('change', () => setState(key, el.value));
  },

  _range(sel, key, valSel) {
    const el = document.querySelector(sel);
    const valEl = document.querySelector(valSel);
    if (!el) return;
    el.value = AppState[key];
    if (valEl) valEl.textContent = AppState[key];
    el.addEventListener('input', () => {
      setState(key, Number(el.value));
      if (valEl) valEl.textContent = el.value;
    });
  }
};
