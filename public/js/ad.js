// AdBanner module — Yandex.RA (РСЯ) ads
const AdBanner = {
  // Block IDs from Yandex.RA
  BLOCK_IDS: {
    dashboard: 'R-A-19545012-1',
    login: 'R-A-19545012-1',
    track: 'R-A-19545012-1',
    view: 'R-A-19545012-1',
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
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
    // Yandex.RA loader
    window.yaContextCb = window.yaContextCb || [];
    const script = document.createElement('script');
    script.src = 'https://yandex.ru/ads/system/context.js';
    script.async = true;
    document.head.appendChild(script);

    // Render ad blocks after script loads
    script.onload = () => {
      for (const [slot, blockId] of Object.entries(this.BLOCK_IDS)) {
        if (!blockId) continue;
        const targetId = 'ad-slot-' + slot;
        const target = document.getElementById(targetId);
        if (target) {
          // Create Yandex container
          const container = document.createElement('div');
          container.id = 'yandex_rtb_' + blockId.replace(/\//g, '_');
          target.innerHTML = '';
          target.appendChild(container);

          window.yaContextCb.push(() => {
            Ya.Context.AdvManager.render({
              blockId: blockId,
              renderTo: container.id,
            });
          });
        }
      }
    };

    // Fallback if script fails to load
    script.onerror = () => {
      this.showPlaceholders();
    };
  },
};

AdBanner.init();
