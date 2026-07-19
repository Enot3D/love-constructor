/* ============================================================
   МОДУЛЬ: ПРЕДПРОСМОТР (PREVIEW)
   Генерирует HTML текущего проекта и обновляет iframe
   в реальном времени при каждом изменении состояния.
   ============================================================ */
const Preview = {
  _iframe: null,
  _timeout: null,
  _blobUrl: null,

  init() {
    this._iframe = document.querySelector('#previewIframe');
    /* Убираем sandbox — Blob URL и так изолирован */
    if (this._iframe) this._iframe.removeAttribute('sandbox');
    /* Подписываемся на изменения состояния */
    subscribe(() => this._debouncedUpdate());
    /* Первичный рендер */
    this.update();
  },

  /* ---- Debounce: не чаще 1 раза в 80мс ---- */
  _debouncedUpdate() {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.update(), 80);
  },

  /* ---- Основной рендер ---- */
  update() {
    if (!this._iframe) return;
    const html = this.generateHTML();
    /* Используем Blob URL — нет проблем с cross-origin и sandbox */
    if (this._blobUrl) URL.revokeObjectURL(this._blobUrl);
    const blob = new Blob([html], { type: 'text/html' });
    this._blobUrl = URL.createObjectURL(blob);
    this._iframe.src = this._blobUrl;
  },

  /* ---- Генерация полного HTML для предпросмотра ---- */
  generateHTML(forExport = false) {
    const s = AppState;

    /* --- Собираем Google Fonts ссылку --- */
    const fonts = new Set(['Inter:300,400,500,600,700']);
    const fontMap = {
      "'Playfair Display', serif": 'Playfair Display',
      "'Cormorant Garamond', serif": 'Cormorant Garamond',
      "'Montserrat', sans-serif": 'Montserrat',
      "'Nunito', sans-serif": 'Nunito',
      "'Pacifico', cursive": 'Pacifico',
      "'Lora', serif": 'Lora',
      "'Raleway', sans-serif": 'Raleway',
      "'Great Vibes', cursive": 'Great Vibes',
      "'Dancing Script', cursive": 'Dancing Script',
    };
    if (fontMap[s.fontFamily]) fonts.add(fontMap[s.fontFamily] + ':300,400,500,600,700');
    if (fontMap[s.btnFont]) fonts.add(fontMap[s.btnFont] + ':300,400,500,600,700');
    s.customFonts.forEach(f => fonts.add(f.replace(/ /g, '+') + ':300,400;700'));

    const fontsLink = `https://fonts.googleapis.com/css2?${Array.from(fonts).map(f => `family=${f.replace(/ /g, '+')}`).join('&')}&display=swap`;

    /* --- Стили кнопок --- */
    const btnShadowCSS = {
      none: 'none',
      sm: '0 2px 8px rgba(0,0,0,0.1)',
      md: '0 4px 16px rgba(0,0,0,0.15)',
      lg: '0 8px 32px rgba(0,0,0,0.2)',
      glow: `0 0 20px ${s.btnYesColor}66`
    }[s.btnShadow] || 'none';

    const btnHoverCSS = {
      scale: 'transform: scale(1.08);',
      glow: `box-shadow: 0 0 30px ${s.btnYesColor}88;`,
      darken: 'filter: brightness(0.9);',
      lift: 'transform: translateY(-3px);',
      none: ''
    }[s.btnHover] || '';

    /* --- Анимация появления кнопок --- */
    const btnAnimInCSS = {
      none: '',
      fade: 'animation: fadeIn 0.8s ease both;',
      'slide-up': 'animation: slideUp 0.8s ease both;',
      zoom: 'animation: zoomIn 0.6s ease both;',
      bounce: 'animation: bounceIn 0.8s ease both;'
    }[s.btnAnimIn] || '';

    /* --- Фон --- */
    let bgCSS = '';
    if (s.bgType === 'solid') bgCSS = `background: ${s.bgColor};`;
    else if (s.bgType === 'gradient') {
      if (s.bgGradDir === 'radial') bgCSS = `background: radial-gradient(circle, ${s.bgGrad1}, ${s.bgGrad2});`;
      else bgCSS = `background: linear-gradient(${s.bgGradDir}, ${s.bgGrad1}, ${s.bgGrad2});`;
    }
    else if (s.bgType === 'image' || s.bgType === 'gif') {
      const url = s.bgImageData || s.bgImageUrl;
      bgCSS = url ? `background: url('${url}') center/cover no-repeat;` : `background: ${s.colorBg};`;
    }
    else if (s.bgType === 'video') bgCSS = `background: ${s.colorBg};`;

    /* --- Фото галерея/карточки --- */
    let photosHTML = '';
    if (s.photos.length > 0) {
      const pShadow = { none: 'none', sm: '0 2px 8px rgba(0,0,0,0.1)', md: '0 4px 20px rgba(0,0,0,0.15)', lg: '0 8px 40px rgba(0,0,0,0.2)' }[s.photoShadow] || 'none';
      const pStyle = `border-radius:${s.photoRadius}px; border:${s.photoBorder}px solid ${s.photoBorderColor}; box-shadow:${pShadow}; opacity:${s.photoOpacity / 100}; max-width:${s.photoSize}%;`;

      if (s.galleryMode === 'grid') {
        photosHTML = `<div class="photos-grid">${s.photos.map(p => `<img src="${p.dataUrl}" style="${pStyle}" alt="Фото">`).join('')}</div>`;
      } else if (s.galleryMode === 'carousel') {
        photosHTML = `<div class="photos-carousel"><div class="carousel-track">${s.photos.map(p => `<div class="carousel-slide"><img src="${p.dataUrl}" style="${pStyle}" alt="Фото"></div>`).join('')}</div></div>`;
      } else if (s.galleryMode === 'slider') {
        photosHTML = `<div class="photos-slider">${s.photos.map((p, i) => `<img src="${p.dataUrl}" style="${pStyle}${i > 0 ? 'display:none' : ''}" alt="Фото" class="slide" data-idx="${i}">`).join('')}<div class="slider-dots">${s.photos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`).join('')}</div></div>`;
      } else if (s.galleryMode === 'fullscreen') {
        photosHTML = `<div class="photos-fullscreen">${s.photos.map(p => `<img src="${p.dataUrl}" style="${pStyle}" alt="Фото">`).join('')}</div>`;
      }
    }

    /* --- Музыка --- */
    let musicHTML = '';
    if (s.musicData) {
      musicHTML = `<audio id="bgMusic" ${s.musicLoop === 'on' ? 'loop' : ''} preload="auto"><source src="${s.musicData}" type="audio/mpeg"></audio>`;
      if (s.musicShowControl === 'on') {
        musicHTML += `<div class="music-control" id="musicControl"><button id="musicToggle">♪</button></div>`;
      }
    }

    /* --- Анимации фона (canvas) --- */
    let animHTML = '';
    if (s.animType !== 'none') {
      animHTML = `<canvas id="animCanvas"></canvas>`;
    }

    /* --- Таймер --- */
    let timerHTML = '';
    if (s.timerType !== 'none' && s.timerDate) {
      timerHTML = `<div class="timer-block" style="font-size:${s.timerSize}px;"><div class="timer-label">${s.timerEvent || 'Обратный отсчёт'}</div><div class="timer-digits" id="timerDigits">--:--:--:--</div></div>`;
    }

    /* --- Украшения --- */
    let decorsHTML = '';
    if (s.decorations.length) {
      decorsHTML = s.decorations.map(d =>
        `<div class="decor-element" data-id="${d.id}" style="position:absolute;left:${d.x}%;top:${d.y}%;font-size:${d.size}px;transform:rotate(${d.rotation}deg);color:${d.color};cursor:move;user-select:none;z-index:5;">${d.emoji}</div>`
      ).join('');
    }

    /* --- SVG элементы --- */
    let svgHTML = '';
    if (s.svgItems.length) {
      svgHTML = s.svgItems.map(sv =>
        `<img src="${sv.dataUrl}" class="svg-decor" style="position:absolute;left:${sv.x}%;top:${sv.y}%;width:${sv.size}px;transform:rotate(${sv.rotation}deg);filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2));" data-id="${sv.id}">`
      ).join('');
    }

    /* --- Выбор даты --- */
    let datePickerHTML = '';
    const dpActive = s.dpEnabled === 'on' && s.dpDates.length > 0;
    if (dpActive) {
      const dpDatesFormatted = s.dpDates.map(d => {
        const dt = new Date(d + 'T00:00:00');
        const dayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const monthNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        return {
          value: d,
          label: `${dt.getDate()} ${monthNames[dt.getMonth()]}, ${dayNames[dt.getDay()]}`
        };
      });
      datePickerHTML = `
        <div class="date-picker-block" id="datePickerBlock">
          <div class="dp-title">${escHTML(s.dpTitle)}</div>
          <div class="dp-options">
            ${dpDatesFormatted.map(d => `<button class="dp-option" data-date="${d.value}">${d.label}</button>`).join('')}
          </div>
        </div>
      `;
    }

    /* --- Печатающийся текст --- */
    const typingAttr = s.fxTyping === 'on' ? ' data-typing="true"' : '';

    /* --- Стили анимаций появления --- */
    let entranceCSS = '';
    if (s.fxEntrance !== 'none') {
      entranceCSS = `animation: ${s.fxEntrance}In 1s ease both;`;
    }

    /* --- Падающие сердечки после «Да» --- */
    const yesHeartsCanvas = s.yesHearts === 'on' ? '<canvas id="heartsCanvas" style="position:fixed;inset:0;pointer-events:none;z-index:9999;"></canvas>' : '';

    /* --- Собираем всё вместе --- */
    return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
<title>${escHTML(s.pageTitle)}</title>
<link href="${fontsLink}" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="${fontsLink}" rel="stylesheet"></noscript>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: ${s.fxSmoothScroll === 'on' ? 'smooth' : 'auto'}; }
  body {
    font-family: ${s.fontFamily};
    font-size: ${s.fontSize}px;
    font-weight: ${s.fontWeight};
    letter-spacing: ${s.fontSpacing}px;
    line-height: ${s.fontLine};
    color: ${s.colorText};
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    position: relative;
    overflow-x: hidden;
    ${bgCSS}
    ${s.bgBlur > 0 ? '' : ''}
  }
  ${s.bgBlur > 0 ? `body::before { content:''; position:fixed; inset:0; ${bgCSS} filter:blur(${s.bgBlur}px); z-index:-2; }` : ''}
  ${s.bgType === 'video' && s.bgVideoUrl ? `body::after { content:''; position:fixed; inset:0; z-index:-2; } video.bg-video { position:fixed; inset:0; width:100%; height:100%; object-fit:cover; z-index:-3; }` : ''}

  .container {
    max-width: 600px;
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 10;
    ${entranceCSS}
  }
  .title {
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 16px;
    color: ${s.colorPrimary};
    ${s.fxTyping === 'on' ? 'overflow:hidden;border-right:2px solid ' + s.colorPrimary + ';white-space:nowrap;animation:typing 3s steps(40) 1s forwards,blink 0.7s step-end infinite;' : ''}
  }
  .main-text {
    margin-bottom: 20px;
    opacity: 0.9;
  }
  .details {
    margin: 16px 0;
    padding: 16px;
    background: rgba(255,255,255,0.5);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid ${s.colorBorder};
  }
  .details p { margin: 6px 0; }
  .signature {
    margin-top: 24px;
    font-style: italic;
    opacity: 0.7;
    font-size: 0.9em;
  }
  .btns {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 28px;
  }
  .btn {
    padding: 14px 40px;
    font-size: ${s.btnSize}px;
    font-weight: 600;
    border: none;
    border-radius: ${s.btnRadius}px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: ${s.btnFont === 'inherit' ? s.fontFamily : s.btnFont};
    box-shadow: ${btnShadowCSS};
    ${btnAnimInCSS}
    position: relative;
  }
  .btn-yes {
    background: ${s.btnYesColor};
    color: #fff;
  }
  .btn-no {
    background: ${s.btnNoColor};
    color: #fff;
  }
  .btn:hover { ${btnHoverCSS} }

  .date-picker-block {
    margin: 24px 0;
    padding: 20px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid ${s.colorBorder};
    text-align: center;
  }
  .dp-title {
    font-size: 1.1em;
    font-weight: 600;
    margin-bottom: 14px;
    color: ${s.colorPrimary};
  }
  .dp-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .dp-option {
    padding: 10px 18px;
    border: 2px solid ${s.colorBorder};
    border-radius: 12px;
    background: rgba(255,255,255,0.7);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: ${s.colorText};
  }
  .dp-option:hover {
    border-color: ${s.colorPrimary};
    background: rgba(233,30,99,0.05);
  }
  .dp-option.selected {
    border-color: ${s.colorPrimary};
    background: ${s.colorPrimary};
    color: #fff;
    transform: scale(1.05);
  }

  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin: 24px 0;
    justify-items: center;
  }
  .photos-grid img { display: block; margin: 0 auto; object-fit: cover; }
  .photos-carousel {
    overflow: hidden;
    margin: 24px auto;
    border-radius: ${s.photoRadius}px;
    max-width: 100%;
  }
  .carousel-track {
    display: flex;
    transition: transform 0.5s ease;
  }
  .carousel-slide {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
  }
  .carousel-slide img { width: 100%; object-fit: cover; }
  .photos-slider { position: relative; margin: 24px auto; text-align: center; max-width: 100%; }
  .photos-slider img { max-width: 100%; margin: 0 auto; display: block; object-fit: cover; }
  .slider-dots { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
  .slider-dots .dot {
    width: 10px; height: 10px; border-radius: 50%; background: ${s.colorBorder}; cursor: pointer;
  }
  .slider-dots .dot.active { background: ${s.colorPrimary}; }
  .photos-fullscreen {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    margin: 24px 0;
    justify-items: center;
  }
  .photos-fullscreen img { width: 100%; cursor: pointer; object-fit: cover; }

  .timer-block { margin: 24px 0; }
  .timer-label { font-size: 0.5em; margin-bottom: 8px; opacity: 0.7; }
  .timer-digits { font-weight: 700; color: ${s.colorPrimary}; font-variant-numeric: tabular-nums; }

  .music-control {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }
  .music-control button {
    width: 48px; height: 48px;
    border-radius: 50%;
    border: none;
    background: ${s.colorPrimary};
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  .music-control button:hover { transform: scale(1.1); }
  .music-control button.playing { animation: pulse 1.5s ease infinite; }

  #animCanvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }

  .yes-screen {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(255,255,255,0.95);
    z-index: 9998;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    animation: fadeIn 0.5s ease;
    overflow-y: auto;
  }
  .yes-screen.show { display: flex; }
  .yes-screen h1 { color: ${s.colorPrimary}; font-size: 2.5em; margin-bottom: 16px; }
  .yes-reminder {
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px 28px;
    margin-top: 12px;
    text-align: left;
    border: 1px solid rgba(255,255,255,0.3);
    max-width: 360px;
    width: 100%;
  }
  .yes-reminder-label { font-size: 0.8em; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .yes-reminder-date { font-size: 1.3em; font-weight: 600; margin-bottom: 6px; }
  .yes-reminder-place { font-size: 1.1em; margin-bottom: 4px; }
  .yes-reminder-for { font-size: 0.95em; opacity: 0.8; margin-top: 8px; }

  .name-input-block {
    margin-top: 20px;
    text-align: center;
    animation: fadeIn 0.5s ease;
  }
  .name-input-block label {
    display: block;
    font-size: 1em;
    margin-bottom: 8px;
    color: ${s.colorText};
    opacity: 0.8;
  }
  .name-input-block input {
    padding: 12px 20px;
    border: 2px solid ${s.colorBorder};
    border-radius: 12px;
    font: inherit;
    font-size: 1em;
    text-align: center;
    width: 100%;
    max-width: 300px;
    outline: none;
    transition: border-color 0.2s;
    background: rgba(255,255,255,0.8);
  }
  .name-input-block input:focus {
    border-color: ${s.colorPrimary};
    box-shadow: 0 0 0 3px ${s.colorPrimary}22;
  }
  .name-input-block .btn-confirm-name {
    margin-top: 12px;
    padding: 10px 28px;
    border: none;
    border-radius: ${s.btnRadius}px;
    background: ${s.btnYesColor};
    color: #fff;
    font: inherit;
    font-size: ${Math.max(14, s.btnSize - 2)}px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .name-input-block .btn-confirm-name:hover { transform: scale(1.05); }

  .message-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 24px 36px;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.2);
    z-index: 2000;
    font-size: 1.2em;
    text-align: center;
    animation: bounceIn 0.5s ease;
    display: none;
  }
  .message-popup.show { display: block; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes bounceIn { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.3); } 50% { transform: translate(-50%,-50%) scale(1.05); } 70% { transform: translate(-50%,-50%) scale(0.9); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
  @keyframes rotateIn { from { opacity: 0; transform: rotate(-200deg); } to { opacity: 1; transform: rotate(0); } }
  @keyframes typing { from { width: 0; } to { width: 100%; } }
  @keyframes blink { 50% { border-color: transparent; } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }

  @media (max-width: 600px) {
    body { padding: 24px 16px; padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); font-size: ${Math.max(14, s.fontSize - 2)}px; }
    .container { max-width: 100%; }
    .title { font-size: 1.5em; }
    .btn { padding: 12px 28px; font-size: ${Math.max(14, s.btnSize - 2)}px; width: 100%; max-width: 280px; }
    .btns { flex-direction: column; align-items: center; gap: 12px; }
    .details { padding: 12px; }
    .photos-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .photos-fullscreen { grid-template-columns: 1fr; }
    .dp-options { flex-direction: column; }
    .dp-option { width: 100%; }
    .music-control { bottom: 12px; right: 12px; }
    .music-control button { width: 40px; height: 40px; font-size: 16px; }
    .yes-screen h1 { font-size: 1.8em; }
    .yes-screen { padding: 24px 16px; padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
    .message-popup { padding: 16px 20px; font-size: 1em; width: 90%; }
    .timer-block { font-size: ${Math.max(24, s.timerSize * 0.7)}px !important; }
    .name-input-block input { max-width: 100%; }
  }
</style>
</head>
<body>

${s.bgType === 'video' && s.bgVideoUrl ? `<video class="bg-video" autoplay muted loop><source src="${escHTML(s.bgVideoUrl)}" type="video/mp4"></video>` : ''}
${animHTML}
${musicHTML}

<div class="container"${typingAttr}>
  <h1 class="title">${escHTML(s.mainTitle)}</h1>
  <p class="main-text">${escHTML(s.mainText)}</p>
  ${photosHTML}
  <div class="details">
    ${!dpActive ? `<p>📅 ${escHTML(s.mainDate)}</p>` : ''}
    <p>📍 ${escHTML(s.mainPlace)}</p>
    <p>Для: <strong>${escHTML(s.girlName)}</strong></p>
  </div>
  ${timerHTML}
  ${datePickerHTML}
  <div class="btns">
    <button class="btn btn-yes" id="btnYes">${escHTML(s.btnYesText)}</button>
    <button class="btn btn-no" id="btnNo">${escHTML(s.btnNoText)}</button>
  </div>
  <p class="signature">${escHTML(s.mainSignature)}, ${escHTML(s.senderName)} ❤</p>
</div>

<div class="yes-screen" id="yesScreen">
  <h1>${escHTML(s.yesText)}</h1>
  <div class="yes-reminder">
    <p class="yes-reminder-label">Не забудь:</p>
    <p class="yes-reminder-date">📅 ${escHTML(s.mainDate)}</p>
    <p class="yes-reminder-place">📍 ${escHTML(s.mainPlace)}</p>
  </div>
  <div id="yesExtra"></div>
</div>

<div class="message-popup" id="msgPopup"></div>

${decorsHTML}
${svgHTML}
${yesHeartsCanvas}

<script>
(function() {
  const s = ${JSON.stringify({
    noMode: s.noMode,
    noSpeed: s.noSpeed,
    noChance: s.noChance,
    messages: s.messages,
    musicData: !!s.musicData,
    musicAutoplay: s.musicAutoplay,
    musicVolume: s.musicVolume,
    musicLoop: s.musicLoop,
    yesShowMsg: s.yesShowMsg,
    yesMusic: s.yesMusic,
    yesConfetti: s.yesConfetti,
    yesFireworks: s.yesFireworks,
    yesHearts: s.yesHearts,
    yesPhoto: s.yesPhoto,
    yesRedirect: s.yesRedirect,
    animType: s.animType,
    askName: s.askName,
    animCount: s.animCount,
    animSpeed: s.animSpeed,
    timerType: s.timerType,
    timerDate: s.timerDate,
    photos: s.photos.map(p => p.dataUrl),
    galleryMode: s.galleryMode,
    galleryAuto: s.galleryAuto,
    galleryInterval: s.galleryInterval,
    colorPrimary: s.colorPrimary,
    colorBorder: s.colorBorder,
    colorText: s.colorText,
    dpEnabled: s.dpEnabled,
    dpDates: s.dpDates,
    dpThankYou: s.dpThankYou,
    publishedId: '__INVITE_ID__',
    siteUrl: window.location.origin,
  })};

  /* ---- Общий ID ответа для этой сессии ---- */
  const responseId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  let selectedDate = null;
  let responseSent = false;

  async function sendResponse(updates) {
    if (!s.publishedId) return;
    try {
      await fetch(s.siteUrl + '/api/respond/' + s.publishedId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ responseId: responseId }, updates))
      });
    } catch (e) { /* тихо */ }
  }

  /* ---- Выбор даты ---- */
  const dpOptions = document.querySelectorAll('.dp-option');

  dpOptions.forEach(opt => {
    opt.addEventListener('click', function() {
      dpOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedDate = opt.dataset.date;
    });
  });

  /* ---- Кнопка «Нет» ---- */
  const btnNo = document.getElementById('btnNo');
  let msgIdx = 0;
  let shrinkScale = 1;

  function applyNoBehavior() {
    if (Math.random() * 100 > s.noChance) return;
    const speed = s.noSpeed;

    switch(s.noMode) {
      case 'run': {
        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 60);
        btnNo.style.position = 'fixed';
        btnNo.style.left = x + 'px';
        btnNo.style.top = y + 'px';
        btnNo.style.transition = (1 / speed * 0.5) + 's ease';
        btnNo.style.zIndex = '9000';
        break;
      }
      case 'teleport': {
        btnNo.style.position = 'fixed';
        btnNo.style.left = Math.random() * (window.innerWidth - 150) + 'px';
        btnNo.style.top = Math.random() * (window.innerHeight - 60) + 'px';
        btnNo.style.transition = '0.05s';
        btnNo.style.zIndex = '9000';
        break;
      }
      case 'jump': {
        btnNo.style.animation = 'none';
        void btnNo.offsetHeight;
        btnNo.style.animation = 'btnJump ' + (1 / speed) + 's ease';
        break;
      }
      case 'spin': {
        btnNo.style.transition = (1 / speed) + 's ease';
        btnNo.style.transform = 'rotate(' + (360 * speed) + 'deg)';
        setTimeout(() => { btnNo.style.transform = ''; }, 1000 / speed * 2);
        break;
      }
      case 'shrink': {
        shrinkScale *= 0.7;
        btnNo.style.transition = '0.3s';
        btnNo.style.transform = 'scale(' + shrinkScale + ')';
        break;
      }
      case 'grow': {
        shrinkScale *= 1.3;
        btnNo.style.transition = '0.3s';
        btnNo.style.transform = 'scale(' + shrinkScale + ')';
        break;
      }
      case 'fade': {
        let op = parseFloat(btnNo.style.opacity || 1);
        op -= 0.15;
        if (op < 0.05) op = 0.05;
        btnNo.style.transition = '0.3s';
        btnNo.style.opacity = op;
        break;
      }
      case 'transparent': {
        btnNo.style.transition = '0.3s';
        btnNo.style.opacity = '0.1';
        btnNo.style.pointerEvents = 'none';
        setTimeout(() => { btnNo.style.opacity = ''; btnNo.style.pointerEvents = ''; }, 1500);
        break;
      }
      case 'text-change': {
        if (s.messages.length) {
          btnNo.textContent = s.messages[msgIdx % s.messages.length].text;
          msgIdx++;
        }
        break;
      }
      case 'combo': {
        const modes = ['run','teleport','jump','spin','shrink','text-change'];
        const pick = modes[Math.floor(Math.random() * modes.length)];
        const saved = s.noMode;
        s.noMode = pick;
        applyNoBehavior();
        s.noMode = saved;
        break;
      }
    }
  }

  if (btnNo) {
    btnNo.addEventListener('mouseenter', applyNoBehavior);
    btnNo.addEventListener('touchstart', function(e) {
      e.preventDefault();
      applyNoBehavior();
    }, { passive: false });

    btnNo.addEventListener('click', function(e) {
      e.preventDefault();
      const popup = document.getElementById('msgPopup');
      if (popup && s.messages.length) {
        popup.textContent = s.messages[msgIdx % s.messages.length].text;
        popup.classList.add('show');
        msgIdx++;
        setTimeout(() => popup.classList.remove('show'), 2000);
      }
    });
  }

  /* ---- Кнопка «Да» ---- */
  const btnYes = document.getElementById('btnYes');
  if (btnYes) {
    btnYes.addEventListener('click', function() {
      const yesScreen = document.getElementById('yesScreen');
      if (yesScreen) yesScreen.classList.add('show');

      if (s.askName === 'on') {
        /* Показать поле ввода имени */
        const extra = document.getElementById('yesExtra');
        if (extra) {
          extra.innerHTML = '<div class="name-input-block"><label>Как тебя зовут?</label><input type="text" id="guestNameInput" placeholder="Введи своё имя" maxlength="100"><br><button class="btn-confirm-name" id="btnConfirmName">Подтвердить</button></div>';
          const confirmBtn = document.getElementById('btnConfirmName');
          const nameInput = document.getElementById('guestNameInput');
          if (confirmBtn && nameInput) {
            nameInput.focus();
            confirmBtn.addEventListener('click', function() {
              const name = nameInput.value.trim();
              sendResponse({ clickedYes: true, selectedDate: selectedDate || null, guestName: name || null });
              if (s.yesMusic) { const audio = document.getElementById('bgMusic'); if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); } }
              if (s.yesConfetti) startConfetti();
              if (s.yesHearts) startHearts();
              if (s.yesFireworks) startFireworks();
              if (s.yesRedirect) { setTimeout(() => { window.location.href = s.yesRedirect; }, 3000); }
              extra.innerHTML = '';
            });
            nameInput.addEventListener('keydown', function(e) {
              if (e.key === 'Enter') confirmBtn.click();
            });
          }
        }
      } else {
        sendResponse({ clickedYes: true, selectedDate: selectedDate || null });
        if (s.yesMusic) { const audio = document.getElementById('bgMusic'); if (audio) { audio.currentTime = 0; audio.play().catch(()=>{}); } }
        if (s.yesConfetti) startConfetti();
        if (s.yesHearts) startHearts();
        if (s.yesFireworks) startFireworks();
        if (s.yesRedirect) { setTimeout(() => { window.location.href = s.yesRedirect; }, 3000); }
      }
    });
  }

  /* ---- Музыка ---- */
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  if (musicToggle && bgMusic) {
    bgMusic.volume = s.musicVolume / 100;
    let playing = false;
    musicToggle.addEventListener('click', function() {
      if (playing) { bgMusic.pause(); musicToggle.classList.remove('playing'); }
      else { bgMusic.play().catch(()=>{}); musicToggle.classList.add('playing'); }
      playing = !playing;
    });
    if (s.musicAutoplay === 'on') {
      document.addEventListener('click', function() { if (!playing) { bgMusic.play().catch(()=>{}); musicToggle.classList.add('playing'); playing = true; } }, { once: true });
    }
  }

  /* ---- Таймер ---- */
  if (s.timerType !== 'none' && s.timerDate) {
    const target = new Date(s.timerDate).getTime();
    const digits = document.getElementById('timerDigits');
    if (digits) {
      setInterval(() => {
        const diff = target - Date.now();
        if (diff <= 0) { digits.textContent = '00:00:00:00'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        digits.textContent = d + 'д ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
      }, 1000);
    }
  }

  /* ---- Анимации (сердечки, снежинки и т.д.) ---- */
  if (s.animType !== 'none') {
    const canvas = document.getElementById('animCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

      const particles = [];
      const emojiMap = {
        hearts: '❤', petals: '🌸', confetti: '🎉',
        bubbles: '○', snow: '❄', stars: '✦',
        soap: '◯', sparks: '·', fireworks: '✧', butterflies: '🦋'
      };
      const emoji = emojiMap[s.animType] || '❤';

      for (let i = 0; i < s.animCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 12 + Math.random() * 16,
          speedY: 0.3 + Math.random() * (s.animSpeed / 3),
          speedX: (Math.random() - 0.5) * 1,
          opacity: 0.4 + Math.random() * 0.6,
          rotation: Math.random() * 360
        });
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.fillText(emoji, 0, 0);
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += 0.3;

          if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
          if (p.x > canvas.width + 20) p.x = -20;
          if (p.x < -20) p.x = canvas.width + 20;
        });
        requestAnimationFrame(animate);
      }
      animate();
    }
  }

  /* ---- Конфетти ---- */
  function startConfetti() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const confetti = [];
    const colors = ['#e91e63','#ff5722','#4caf50','#2196f3','#ffeb3b','#9c27b0'];
    for (let i = 0; i < 150; i++) {
      confetti.push({ x: Math.random() * c.width, y: Math.random() * c.height - c.height, w: 8 + Math.random() * 6, h: 4 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)], speedY: 2 + Math.random() * 4, speedX: (Math.random() - 0.5) * 3, rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 8 });
    }
    let frames = 0;
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      confetti.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.speedY; p.x += p.speedX; p.rotation += p.rotSpeed;
        if (p.y > c.height + 20) p.y = -20;
      });
      frames++;
      if (frames < 300) requestAnimationFrame(draw);
      else c.remove();
    }
    draw();
  }

  /* ---- Падающие сердца после «Да» ---- */
  function startHearts() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const hearts = [];
    for (let i = 0; i < 50; i++) {
      hearts.push({ x: Math.random() * c.width, y: -20 - Math.random() * 200, size: 16 + Math.random() * 20, speed: 1 + Math.random() * 3, opacity: 0.5 + Math.random() * 0.5, wobble: Math.random() * Math.PI * 2 });
    }
    let frames = 0;
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      hearts.forEach(h => {
        ctx.globalAlpha = h.opacity;
        ctx.font = h.size + 'px serif';
        ctx.fillText('❤', h.x + Math.sin(h.wobble) * 20, h.y);
        h.y += h.speed; h.wobble += 0.03;
      });
      frames++;
      if (frames < 400) requestAnimationFrame(draw);
      else c.remove();
    }
    draw();
  }

  /* ---- Фейерверк ---- */
  function startFireworks() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const sparks = [];
    function burst(x, y) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 60 + Math.random() * 40, color, size: 2 + Math.random() * 2 });
      }
    }
    let frames = 0;
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, c.width, c.height);
      if (frames % 40 === 0 && frames < 250) burst(Math.random() * c.width, 100 + Math.random() * (c.height * 0.5));
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 100;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0) sparks.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      frames++;
      if (frames < 300 || sparks.length) requestAnimationFrame(draw);
      else c.remove();
    }
    draw();
  }

  /* ---- Галерея: карусель ---- */
  if (s.galleryMode === 'carousel' && s.galleryAuto === 'on') {
    const track = document.querySelector('.carousel-track');
    if (track) {
      let idx = 0;
      const total = track.children.length;
      setInterval(() => { idx = (idx + 1) % total; track.style.transform = 'translateX(-' + (idx * 100) + '%)'; }, s.galleryInterval * 1000);
    }
  }

  /* ---- Слайдер ---- */
  if (s.galleryMode === 'slider') {
    const dots = document.querySelectorAll('.slider-dots .dot');
    const slides = document.querySelectorAll('.photos-slider .slide');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.idx);
        slides.forEach((s, i) => s.style.display = i === idx ? '' : 'none');
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });
    if (s.galleryAuto === 'on' && slides.length > 1) {
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % slides.length;
        slides.forEach((s, i) => s.style.display = i === idx ? '' : 'none');
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }, s.galleryInterval * 1000);
    }
  }

  /* ---- Перетаскивание украшений ---- */
  document.querySelectorAll('.decor-element, .svg-decor').forEach(el => {
    let dragging = false, startX, startY, origX, origY;
    el.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      origX = parseFloat(el.style.left); origY = parseFloat(el.style.top);
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const parentW = el.parentElement.offsetWidth || window.innerWidth;
      const parentH = el.parentElement.offsetHeight || window.innerHeight;
      const dx = (e.clientX - startX) / parentW * 100;
      const dy = (e.clientY - startY) / parentH * 100;
      el.style.left = (origX + dx) + '%';
      el.style.top = (origY + dy) + '%';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  });

})();
<\/script>
</body>
</html>`;
  },


};
