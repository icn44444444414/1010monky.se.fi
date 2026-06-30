// a11y/Fallback.js — no-motion / no-WebGL path. The page is fully usable without the overlay;
// we just drop a small STATIC pixel monkey perched on the moon so the brand still reads.

export function mountFallback() {
  if (document.getElementById('ape-fallback')) return;
  const el = document.createElement('div');
  el.id = 'ape-fallback';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '🐒';
  Object.assign(el.style, {
    position: 'fixed',
    left: '50%',
    top: 'calc(46% + 1px)',
    transform: 'translate(-50%, -120%)',
    fontSize: 'clamp(28px, 5vw, 48px)',
    zIndex: '20',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4))',
  });
  document.body.appendChild(el);
}
