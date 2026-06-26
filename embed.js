/**
 * Kalenex embed widget loader (Phase 12 Step 2).
 * Served from https://www.kalenex.com/embed.js — include this script on any
 * external site, then call Kalenex.initWidget({...}) for a floating
 * "Book a meeting" button, or Kalenex.openPopup(url) from your own button.
 */
(() => {
  const OVERLAY_ID = 'kalenex-embed-overlay';

  function openPopup(url) {
    if (document.getElementById(OVERLAY_ID)) return; // already open

    const separator = url.includes('?') ? '&' : '?';
    const iframeSrc = `${url}${separator}hideHeader=true`;

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483000',
      'background:rgba(0,0,0,0.5)',
      'display:flex', 'align-items:center', 'justify-content:center',
    ].join(';');

    const modal = document.createElement('div');
    modal.style.cssText = [
      'position:relative', 'width:min(480px, 92vw)', 'height:min(720px, 90vh)',
      'background:#fff', 'border-radius:12px', 'overflow:hidden',
      'box-shadow:0 12px 40px rgba(0,0,0,0.25)',
    ].join(';');

    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = [
      'position:absolute', 'top:8px', 'right:8px', 'z-index:1',
      'width:32px', 'height:32px', 'border-radius:50%', 'border:none',
      'background:rgba(0,0,0,0.06)', 'font-size:20px', 'line-height:1',
      'cursor:pointer',
    ].join(';');
    closeBtn.addEventListener('click', closePopup);

    const iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.cssText = 'width:100%;height:100%;border:none;';

    modal.appendChild(closeBtn);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
    document.body.appendChild(overlay);

    window.addEventListener('message', onMessage);
  }

  function closePopup() {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    window.removeEventListener('message', onMessage);
  }

  function onMessage(event) {
    let data = event.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (_) { return; }
    }
    if (data && data.type === 'kalenex:booked') {
      // Give the visitor a moment to see the confirmation before closing.
      setTimeout(closePopup, 2500);
    }
  }

  function initWidget(options) {
    const opts = options || {};
    const url = opts.url;
    const color = opts.color || '#92D050';
    const text = opts.text || 'Book a meeting';
    if (!url) {
      console.error('Kalenex.initWidget: "url" is required');
      return;
    }

    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:2147482999',
      `background:${color}`, 'color:#fff', 'border:none', 'border-radius:999px',
      'padding:14px 22px', 'font-size:15px', 'font-weight:600',
      'font-family:Arial,Helvetica,sans-serif', 'cursor:pointer',
      'box-shadow:0 4px 14px rgba(0,0,0,0.2)',
    ].join(';');
    button.addEventListener('click', () => openPopup(url));
    document.body.appendChild(button);
  }

  window.Kalenex = { initWidget, openPopup };
})();
