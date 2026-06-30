// engine/ScrollChoreographer.js — binds page scroll to a 0..1 progress via GSAP ScrollTrigger.
//
// scrub:true makes the monkey scroll-LINKED (drag the scrollbar back and the jump reverses).
// It owns no drawing — it just reports progress to a callback each update.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollChoreographer {
  /** @param {(progress:number)=>void} onProgress */
  constructor(onProgress) {
    this.onProgress = onProgress;
    this.trigger = null;
  }

  start() {
    this.trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => this.onProgress(self.progress),
      onRefresh: (self) => this.onProgress(self.progress),
    });
    // emit an initial value
    this.onProgress(0);
  }

  refresh() {
    ScrollTrigger.refresh();
  }

  dispose() {
    if (this.trigger) this.trigger.kill();
    this.trigger = null;
  }
}
