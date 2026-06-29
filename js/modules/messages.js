/* ============================================================
   МОДУЛЬ: СООБЩЕНИЯ
   Список сообщений, появляющихся при нажатии «Нет».
   Поддержка добавления, удаления, редактирования, перетаскивания.
   ============================================================ */
const MessagesModule = {
  _dragIdx: null,

  init() {
    this._render();

    const btnAdd = document.querySelector('#btnAddMessage');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        AppState.messages.push({ id: uid(), text: 'Новое сообщение' });
        setState('messages', [...AppState.messages]);
        this._render();
      });
    }
  },

  _render() {
    const list = document.querySelector('#messagesList');
    if (!list) return;

    list.innerHTML = AppState.messages.map((m, i) => `
      <div class="message-item" draggable="true" data-idx="${i}">
        <span class="msg-handle">☰</span>
        <input type="text" value="${this._esc(m.text)}" data-idx="${i}">
        <button class="btn-remove" data-idx="${i}">×</button>
      </div>
    `).join('');

    /* Редактирование текста */
    list.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        const idx = Number(inp.dataset.idx);
        AppState.messages[idx].text = inp.value;
        setState('messages', [...AppState.messages]);
      });
    });

    /* Удаление */
    list.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        AppState.messages.splice(idx, 1);
        setState('messages', [...AppState.messages]);
        this._render();
      });
    });

    /* Drag & Drop сортировка */
    list.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('dragstart', () => {
        this._dragIdx = Number(item.dataset.idx);
      });
      item.addEventListener('dragover', e => { e.preventDefault(); });
      item.addEventListener('drop', e => {
        e.preventDefault();
        const toIdx = Number(item.dataset.idx);
        if (this._dragIdx !== null && this._dragIdx !== toIdx) {
          const [moved] = AppState.messages.splice(this._dragIdx, 1);
          AppState.messages.splice(toIdx, 0, moved);
          setState('messages', [...AppState.messages]);
          this._render();
        }
        this._dragIdx = null;
      });
    });
  },

  _esc(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
};
