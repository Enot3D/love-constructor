/* ============================================================
   МОДУЛЬ: СООБЩЕНИЯ
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
        <input type="text" value="${escHTML(m.text)}" data-idx="${i}">
        <button class="btn-remove" data-idx="${i}">×</button>
      </div>
    `).join('');

    list.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        const idx = Number(inp.dataset.idx);
        AppState.messages[idx].text = inp.value;
        setState('messages', [...AppState.messages]);
      });
    });

    list.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        AppState.messages.splice(idx, 1);
        setState('messages', [...AppState.messages]);
        this._render();
      });
    });

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
  }
};
