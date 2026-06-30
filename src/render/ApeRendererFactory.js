// render/ApeRendererFactory.js — picks the renderer by capability. The one place the engine
// learns which concrete renderer exists. Swap/add renderers here only.

import { hasWebGL } from '../a11y/capability.js';
import { PixiApeRenderer } from './PixiApeRenderer.js';

/** @returns {{renderer: import('./ApeRenderer.js').ApeRenderer|null, kind:'pixi'|'none'}} */
export function createRenderer() {
  if (hasWebGL()) return { renderer: new PixiApeRenderer(), kind: 'pixi' };
  return { renderer: null, kind: 'none' };
}
