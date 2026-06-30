/* ============================================================
   МОДУЛЬ: ТАЙМЕР
   ============================================================ */
const TimerModule = {
  init() {
    bindField('#timerType', 'timerType', { changeOnly: true });
    bindField('#timerDate', 'timerDate');
    bindField('#timerEvent', 'timerEvent');
    bindRange('#timerSize', 'timerSize', '#timerSizeVal');

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
  }
};
