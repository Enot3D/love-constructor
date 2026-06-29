/* ============================================================
   МОДУЛЬ: УКРАШЕНИЯ
   Добавление эмодзи-декораций на страницу.
   ============================================================ */
const DecorationsModule = {
  _selectedId: null,

  emojiMap: {
    heart: '❤',
    star: '★',
    flower: '✿',
    butterfly: '🦋',
    moon: '☾',
    sun: '☀',
    ribbon: '🎀',
    balloon: '🎉',
    sparkle: '✨',
    rose: '🌹'
  },

  init() {
    /* Кнопки добавления */
    document.querySelectorAll('.decor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.decor;
        AppState.decorations.push({
          id: uid(),
          type,
          emoji: this.emojiMap[type] || '❤',
          size: 40,
          rotation: 0,
          color: '#e91e63',
          x: 50 + Math.random() * 20 - 10,
          y: 50 + Math.random() * 20 - 10
        });
        setState('decorations', [...AppState.decorations]);
      });
    });

    /* Настройки выбранного украшения */
    this._range('#decorSize', '#decorSizeVal', 'size');
    this._range('#decorRotate', '#decorRotateVal', 'rotation');
    const colorEl = document.querySelector('#decorColor');
    if (colorEl) {
      colorEl.addEventListener('input', () => {
        if (!this._selectedId) return;
        const d = AppState.decorations.find(d => d.id === this._selectedId);
        if (d) { d.color = colorEl.value; setState('decorations', [...AppState.decorations]); }
      });
    }
  },

  selectDecoration(id) {
    this._selectedId = id;
    const d = AppState.decorations.find(d => d.id === id);
    if (!d) return;
    const settings = document.querySelector('#decorSettings');
    if (settings) settings.style.display = '';

    const sizeEl = document.querySelector('#decorSize');
    const rotateEl = document.querySelector('#decorRotate');
    const colorEl = document.querySelector('#decorColor');
    if (sizeEl) sizeEl.value = d.size;
    if (rotateEl) rotateEl.value = d.rotation;
    if (colorEl) colorEl.value = d.color;

    document.querySelector('#decorSizeVal').textContent = d.size;
    document.querySelector('#decorRotateVal').textContent = d.rotation;
  },

  _range(inputSel, valSel, prop) {
    const el = document.querySelector(inputSel);
    const valEl = document.querySelector(valSel);
    if (!el) return;
    el.addEventListener('input', () => {
      if (!this._selectedId) return;
      const d = AppState.decorations.find(d => d.id === this._selectedId);
      if (d) {
        d[prop] = Number(el.value);
        setState('decorations', [...AppState.decorations]);
        if (valEl) valEl.textContent = el.value;
      }
    });
  }
};
