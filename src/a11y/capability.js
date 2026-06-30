// Capability + preference detection. The engine consults this before doing anything fancy.

/** @returns {boolean} true if the user asked for reduced motion. */
export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** @returns {boolean} true on touch / coarse-pointer devices (no custom cursor, simplified motion). */
export function isTouch() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

/** @returns {boolean} true if WebGL is available (required for the Pixi renderer). */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** @returns {{motion:boolean, cursor:boolean, webgl:boolean}} the resolved feature gates. */
export function resolveCapabilities() {
  const reduced = prefersReducedMotion();
  const touch = isTouch();
  const webgl = hasWebGL();
  return {
    motion: !reduced && webgl,        // run the jump engine only with motion + WebGL
    cursor: !reduced && !touch,        // custom banana cursor only on fine-pointer, motion-ok
    webgl,
  };
}
