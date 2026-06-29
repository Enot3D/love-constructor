/* ============================================================
   МЕНЕДЖЕР СОСТОЯНИЯ (STATE)
   Централизованное хранение всех настроек конструктора.
   При любом изменении автоматически обновляет предпросмотр.
   ============================================================ */

const AppState = {
  /* ---------- Основное ---------- */
  pageTitle: 'Приглашение на свидание',
  mainTitle: 'Ты согласна пойти со мной на свидание?',
  mainText: 'Я хочу провести с тобой незабываемый вечер полный романтики и тепла.',
  yesText: 'Ура! Я так счастлив! Встречаемся в указанном месте и времени!',
  mainSignature: 'С любовью',
  mainDate: '14 февраля, 19:00',
  mainPlace: 'Кафе «У моря»',
  girlName: 'Анна',
  senderName: 'Максим',

  /* ---------- Кнопки ---------- */
  btnYesText: 'Да!',
  btnNoText: 'Нет',
  btnSize: 16,
  btnYesColor: '#e91e63',
  btnNoColor: '#9e9e9e',
  btnRadius: 50,
  btnFont: 'inherit',
  btnShadow: 'md',
  btnHover: 'scale',
  btnAnimIn: 'fade',

  /* ---------- Поведение кнопки «Нет» ---------- */
  noMode: 'normal',
  noSpeed: 5,
  noChance: 100,

  /* ---------- Фото ---------- */
  photos: [],         // { id, dataUrl, isMain }
  photoRadius: 12,
  photoBorderColor: '#ffffff',
  photoBorder: 0,
  photoShadow: 'md',
  photoSize: 100,
  photoOpacity: 100,

  /* ---------- Галерея ---------- */
  galleryMode: 'grid',
  galleryAuto: 'on',
  galleryInterval: 3,

  /* ---------- Музыка ---------- */
  musicData: null,     // base64 data-url
  musicName: '',
  musicAutoplay: 'off',
  musicVolume: 50,
  musicLoop: 'on',
  musicShowControl: 'on',

  /* ---------- Фон ---------- */
  bgType: 'solid',
  bgColor: '#fce4ec',
  bgGrad1: '#fce4ec',
  bgGrad2: '#f8bbd0',
  bgGradDir: 'to bottom',
  bgImageUrl: '',
  bgImageData: null,
  bgVideoUrl: '',
  bgBlur: 0,
  bgParallax: 'off',

  /* ---------- Темы ---------- */
  activeTheme: '',

  /* ---------- Шрифты ---------- */
  fontFamily: "'Inter', sans-serif",
  fontSize: 18,
  fontWeight: '400',
  fontSpacing: 0,
  fontLine: 1.6,
  customFonts: [],

  /* ---------- Анимации ---------- */
  animType: 'none',
  animCount: 30,
  animSpeed: 5,

  /* ---------- Эффекты ---------- */
  fxTyping: 'off',
  fxEntrance: 'none',
  fxSmoothScroll: 'off',
  fxParallax: 'off',

  /* ---------- Сообщения ---------- */
  messages: [
    { id: 1, text: 'Ты уверена?' },
    { id: 2, text: 'Подумай ещё раз...' },
    { id: 3, text: 'Ну пожалуйста!' },
    { id: 4, text: 'Последний шанс!' },
    { id: 5, text: 'Ты почти нажала!' },
    { id: 6, text: 'Кажется, кнопка убежала...' },
  ],

  /* ---------- После «Да» ---------- */
  yesShowMsg: 'on',
  yesMusic: 'on',
  yesConfetti: 'on',
  yesFireworks: 'off',
  yesHearts: 'on',
  yesPhoto: 'off',
  yesVideoUrl: '',
  yesRedirect: '',
  yesTimer: 'off',

  /* ---------- Таймер ---------- */
  timerType: 'none',
  timerDate: '',
  timerEvent: 'Наше свидание',
  timerSize: 48,

  /* ---------- Цвета ---------- */
  colorPrimary: '#e91e63',
  colorAccent: '#ff5722',
  colorBg: '#fce4ec',
  colorButtons: '#e91e63',
  colorText: '#333333',
  colorBorder: '#f8bbd0',
  colorShadow: '#00000020',

  /* ---------- SVG ---------- */
  svgItems: [],       // { id, dataUrl, color, size, rotation, x, y }

  /* ---------- Украшения ---------- */
  decorations: [],    // { id, type, emoji, size, rotation, color, x, y }
};

/* ---- Счётчик уникальных ID ---- */
let _idCounter = Date.now();
function uid() { return ++_idCounter; }

/* ---- Подписчики на изменения ---- */
const _listeners = [];

function subscribe(fn) {
  _listeners.push(fn);
}

function notify() {
  _listeners.forEach(fn => fn(AppState));
}

/* ---- Установка значения + уведомление ---- */
function setState(key, value) {
  AppState[key] = value;
  notify();
}

/* ---- Пакетное обновление (одно уведомление) ---- */
function batchSetState(obj) {
  Object.assign(AppState, obj);
  notify();
}

/* ---- Сохранение в LocalStorage ---- */
function saveProject() {
  try {
    const data = {};
    for (const key in AppState) {
      if (key === 'musicData' || key === 'bgImageData') {
        if (AppState[key]) data[key] = AppState[key];
      } else {
        data[key] = AppState[key];
      }
    }
    localStorage.setItem('loveConstructor', JSON.stringify(data));
  } catch (e) {
    console.warn('Не удалось сохранить проект:', e);
  }
}

/* ---- Загрузка из LocalStorage ---- */
function loadProject() {
  try {
    const raw = localStorage.getItem('loveConstructor');
    if (!raw) return false;
    const data = JSON.parse(raw);
    Object.assign(AppState, data);
    notify();
    return true;
  } catch (e) {
    console.warn('Не удалось загрузить проект:', e);
    return false;
  }
}

/* ---- Сброс к начальным настройкам ---- */
function resetProject() {
  const defaults = {
    pageTitle: 'Приглашение на свидание',
    mainTitle: 'Ты согласна пойти со мной на свидание?',
    mainText: 'Я хочу провести с тобой незабываемый вечер полный романтики и тепла.',
    yesText: 'Ура! Я так счастлив! Встречаемся в указанном месте и времени!',
    mainSignature: 'С любовью',
    mainDate: '14 февраля, 19:00',
    mainPlace: 'Кафе «У моря»',
    girlName: 'Анна',
    senderName: 'Максим',
    photos: [],
    musicData: null,
    musicName: '',
    bgImageData: null,
    svgItems: [],
    decorations: [],
    messages: [
      { id: 1, text: 'Ты уверена?' },
      { id: 2, text: 'Подумай ещё раз...' },
      { id: 3, text: 'Ну пожалуйста!' },
      { id: 4, text: 'Последний шанс!' },
      { id: 5, text: 'Ты почти нажала!' },
      { id: 6, text: 'Кажется, кнопка убежала...' },
    ],
  };
  Object.assign(AppState, defaults);
  notify();
}
