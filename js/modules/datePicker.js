/* ============================================================
   МОДУЛЬ: ВЫБОР ДАТЫ
   ============================================================ */
const DatePickerModule = {
  init() {
    bindField('#dpEnabled', 'dpEnabled');
    bindField('#dpTitle', 'dpTitle');
    bindField('#dpConfirmText', 'dpConfirmText');
    bindField('#dpThankYou', 'dpThankYou');

    const btnAdd = document.querySelector('#btnAddDate');
    const dateInput = document.querySelector('#dpNewDate');
    if (btnAdd && dateInput) {
      btnAdd.addEventListener('click', () => {
        const val = dateInput.value;
        if (!val || AppState.dpDates.includes(val)) return;
        AppState.dpDates.push(val);
        AppState.dpDates.sort();
        setState('dpDates', [...AppState.dpDates]);
        dateInput.value = '';
        this._renderDates();
      });
    }

    const btnRefresh = document.querySelector('#btnRefreshResponses');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => ResponsesModule.load());
    }

    this._renderDates();
  },

  _renderDates() {
    const list = document.querySelector('#dpDatesList');
    if (!list) return;
    if (AppState.dpDates.length === 0) {
      list.innerHTML = '<p class="panel-desc">Нет добавленных дат.</p>';
      return;
    }
    list.innerHTML = AppState.dpDates.map((d, i) => {
      const formatted = new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
      });
      return `
        <div class="message-item">
          <span style="flex:1;font-size:13px;">${formatted}</span>
          <button class="btn-remove" data-idx="${i}">×</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        AppState.dpDates.splice(idx, 1);
        setState('dpDates', [...AppState.dpDates]);
        this._renderDates();
      });
    });
  }
};
