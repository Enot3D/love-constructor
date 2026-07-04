// AdBanner module — lazy-loads Yandex.RA (РСЯ) ads
const AdBanner = {
  // Вставьте сюда block_id из Яндекс.Рекламы (формат: R-A-XXXXXXXX-X)
  // Получить можно в partner.yandex.ru → Рекламные блоки → Создать блок
  BLOCK_IDS: {
    dashboard: '',  // R-A-XXXXXXXX-X (горизонтальный баннер 728x90)
    login: '',      // R-A-XXXXXXXX-X (компактный 320x50)
    track: '',      // R-A-XXXXXXXX-X (горизонтальный баннер 728x90)
    view: '',       // R-A-XXXXXXXX-X (компактный 320x50)
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // Загружаем Яндекс.Рекламу если есть хотя бы один блок
      const hasBlocks = Object.values(this.BLOCK_IDS).some(id => id);
      if (hasBlocks) {
        this.loadYandexRA();
      } else {
        this.showPlaceholders();
      }
    });
  },

  showPlaceholders() {
    document.querySelectorAll('[id^="ad-slot-"]').forEach(el => {
      el.innerHTML = '<span class="ad-fallback">LoveConstructor.ru</span>';
    });
  },

  loadYandexRA() {
    // Загружаем скрипт Яндекс.Рекламы
    (function(w, d, n, s, t) {
      w[n] = w[n] || function() { (w[n].q = w[n].q || []).push(arguments); };
      t = d.createElement(s); t.async = 1;
      t.src = 'https://an.yandex.ru/system/context.js';
      s = d.head || d.getElementsByTagName('s')[0];
      s.parentNode.insertBefore(t, s);
    })(window, window.document, 'yandex_context_async_callbacks', 'script');

    // Рендерим рекламные блоки
    window.yandex_context_async_callbacks = window.yandex_context_async_callbacks || [];
    window.yandex_context_async_callbacks.push(() => {
      for (const [slot, blockId] of Object.entries(this.BLOCK_IDS)) {
        if (!blockId) continue;
        const target = document.getElementById('ad-slot-' + slot);
        if (target) {
          Ya.Context.AdvManager.render({
            'block_id': blockId,
            'render_to': 'ad-slot-' + slot,
          });
        }
      }
    });
  },
};

AdBanner.init();
