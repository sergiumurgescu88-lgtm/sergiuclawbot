(function() {
  // Rulează doar pe mobil
  if (!window.matchMedia('(max-width: 768px)').matches) return;

  function applyFixes() {
    // 1. Forțează font-size ≥16px & touch targets pe elemente interactive
    document.querySelectorAll('input, textarea, select, button, a.btn, [role="button"], .btn, .wz-btn-next, .wz-btn-action, .copy-btn, .fs-btn').forEach(el => {
      const fs = parseFloat(window.getComputedStyle(el).fontSize);
      if (fs < 16) {
        el.style.fontSize = '16px';
        el.style.minHeight = '48px';
        el.style.padding = '12px 16px';
        el.style.boxSizing = 'border-box';
      }
    });

    // 2. Ridică elementele fixed/sticky cu bottom deasupra safe-area + bottom-nav
    document.querySelectorAll('[style*="position: fixed"], [style*="position: sticky"], .wz-chat-toggle, .fs-btn, .wz-nav, .wizard-actions, .bottom-nav').forEach(el => {
      const pos = window.getComputedStyle(el).position;
      if ((pos === 'fixed' || pos === 'sticky') && el.style.bottom && /^\d+px$/.test(el.style.bottom)) {
        el.style.bottom = 'calc(75px + env(safe-area-inset-bottom, 0px))';
      }
    });

    // 3. Asigură padding jos pe containerele principale
    document.querySelectorAll('.main-content, .app, .wz-shell, main, body').forEach(el => {
      el.style.paddingBottom = 'calc(90px + env(safe-area-inset-bottom, 0px))';
    });
  }

  // Rulează la încărcare și la resize/orientare change
  applyFixes();
  window.addEventListener('resize', applyFixes);
  window.addEventListener('orientationchange', () => setTimeout(applyFixes, 100));
})();
