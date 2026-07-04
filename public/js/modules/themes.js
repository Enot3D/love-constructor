/* ============================================================
   МОДУЛЬ: ТЕМЫ
   Готовые темы оформления.
   ============================================================ */
const ThemesModule = {
  themes: [
    {
      id: 'romance', name: 'Романтика',
      colors: { primary: '#e91e63', accent: '#ff5722', bg: '#fce4ec', text: '#333', border: '#f8bbd0' },
      bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)',
      font: "'Playfair Display', serif"
    },
    {
      id: 'pink', name: 'Розовый',
      colors: { primary: '#ec407a', accent: '#f48fb1', bg: '#fce4ec', text: '#4a1a2e', border: '#f8bbd0' },
      bg: 'linear-gradient(to bottom, #fce4ec, #f8bbd0)',
      font: "'Nunito', sans-serif"
    },
    {
      id: 'lavender', name: 'Лавандовый',
      colors: { primary: '#7e57c2', accent: '#b39ddb', bg: '#ede7f6', text: '#311b92', border: '#d1c4e9' },
      bg: 'linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%)',
      font: "'Cormorant Garamond', serif"
    },
    {
      id: 'sunset', name: 'Закат',
      colors: { primary: '#ff7043', accent: '#ffab91', bg: '#fff3e0', text: '#bf360c', border: '#ffccbc' },
      bg: 'linear-gradient(to bottom, #fff3e0, #ffccbc, #ff8a65)',
      font: "'Raleway', sans-serif"
    },
    {
      id: 'cosmos', name: 'Космос',
      colors: { primary: '#7c4dff', accent: '#b388ff', bg: '#1a1a2e', text: '#e0e0ff', border: '#3a3a5c' },
      bg: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
      font: "'Montserrat', sans-serif"
    },
    {
      id: 'night', name: 'Ночное небо',
      colors: { primary: '#448aff', accent: '#82b1ff', bg: '#0d1b2a', text: '#e0e1dd', border: '#1b263b' },
      bg: 'linear-gradient(to bottom, #0d1b2a, #1b263b, #415a77)',
      font: "'Inter', sans-serif"
    },
    {
      id: 'minimal', name: 'Минимализм',
      colors: { primary: '#212121', accent: '#757575', bg: '#ffffff', text: '#212121', border: '#e0e0e0' },
      bg: '#ffffff',
      font: "'Inter', sans-serif"
    },
    {
      id: 'flowers', name: 'Цветы',
      colors: { primary: '#e91e63', accent: '#4caf50', bg: '#fff8e1', text: '#3e2723', border: '#ffecb3' },
      bg: 'linear-gradient(135deg, #fff8e1, #f1f8e9)',
      font: "'Dancing Script', cursive"
    },
    {
      id: 'hearts', name: 'Сердечки',
      colors: { primary: '#d32f2f', accent: '#ef5350', bg: '#ffebee', text: '#b71c1c', border: '#ffcdd2' },
      bg: 'linear-gradient(to bottom, #ffebee, #ffcdd2)',
      font: "'Great Vibes', cursive"
    },
    {
      id: 'winter', name: 'Зима',
      colors: { primary: '#0277bd', accent: '#81d4fa', bg: '#e1f5fe', text: '#01579b', border: '#b3e5fc' },
      bg: 'linear-gradient(to bottom, #e1f5fe, #b3e5fc)',
      font: "'Nunito', sans-serif"
    },
    {
      id: 'spring', name: 'Весна',
      colors: { primary: '#66bb6a', accent: '#aed581', bg: '#e8f5e9', text: '#1b5e20', border: '#c8e6c9' },
      bg: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
      font: "'Lora', serif"
    }
  ],

  init() {
    this._render();
  },

  _render() {
    const grid = document.querySelector('#themesGrid');
    if (!grid) return;
    grid.innerHTML = this.themes.map(t => `
      <div class="theme-card ${AppState.activeTheme === t.id ? 'active' : ''}" data-theme="${t.id}">
        <div class="theme-preview" style="background: ${t.bg};"></div>
        ${t.name}
      </div>
    `).join('');

    grid.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const theme = this.themes.find(t => t.id === card.dataset.theme);
        if (!theme) return;
        this._apply(theme);
      });
    });
  },

  _apply(theme) {
    batchSetState({
      activeTheme: theme.id,
      colorPrimary: theme.colors.primary,
      colorAccent: theme.colors.accent,
      colorBg: theme.colors.bg,
      colorText: theme.colors.text,
      colorBorder: theme.colors.border,
      colorButtons: theme.colors.primary,
      btnYesColor: theme.colors.primary,
      btnNoColor: theme.colors.accent,
      fontFamily: theme.font,
    });
    this._render();
  }
};
