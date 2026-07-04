// AdBanner module — lazy-loads ad scripts and manages ad slots
const AdBanner = {
  // Ad slot configuration
  slots: {
    'ad-slot-dashboard': { format: 'banner', priority: 1 },
    'ad-slot-login': { format: 'compact', priority: 2 },
    'ad-slot-track': { format: 'banner', priority: 3 },
    'ad-slot-view': { format: 'compact', priority: 4 },
  },

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // In development, show placeholder
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        this.showPlaceholders();
        return;
      }

      // In production, load ad script
      this.loadAdScript();
    });
  },

  showPlaceholders() {
    Object.keys(this.slots).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<span class="ad-fallback">LoveConstructor.ru</span>';
      }
    });
  },

  loadAdScript() {
    // --- Yandex.RA (РСЯ) example ---
    // Uncomment and configure when you have a Yandex.RA publisher ID:
    //
    // (function(w, d, n, s, t) {
    //   w[n] = w[n] || function() { (w[n].q = w[n].q || []).push(arguments); };
    //   t = d.createElement(s); t.async = 1; t.src = 'https://an.yandex.ru/system/context.js';
    //   s = d.head || d.getElementsByTagName('s')[0]; s.parentNode.insertBefore(t, s);
    // })(window, window.document, 'yandex_context_async_callbacks', 'script');
    //
    // window.yandex_context_async_callbacks.push(() => {
    //   Ya.Context.AdvManager.render({
    //     'block_id': 'R-A-XXXXXXXX-X',
    //     'render_to': 'ad-slot-dashboard'
    //   });
    // });

    // --- Google AdSense example ---
    // Uncomment and configure when you have AdSense publisher ID:
    //
    // const script = document.createElement('script');
    // script.async = true;
    // script.crossOrigin = 'anonymous';
    // script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
    // document.head.appendChild(script);

    // Default: show fallback for now
    this.showPlaceholders();
  },
};

AdBanner.init();
