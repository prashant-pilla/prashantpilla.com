import { JS_CLASS, MOTION_CLASS, PRELOAD_CLASS, PRELOADED_KEY } from './constants';

/**
 * Inline bootstrap for the motion layer, rendered next to ThemeScript so it
 * runs during HTML parsing, before first paint:
 *
 *  - adds `js` to <html> (only then does CSS hide `[data-reveal]` so
 *    content is fully visible without JS or under reduced motion);
 *  - adds `pp-preload` on the first visit of the session so a CSS curtain
 *    (`html.pp-preload::before`, same `--bg`) covers the page until the
 *    React preloader mounts and takes over without a flash;
 *  - safety net: if the motion bundle has not marked itself live
 *    (`pp-motion`) within 6s, both classes are removed and everything
 *    shows.
 *
 * Server component; trusted constant string, no user input.
 */
const SCRIPT = `(function(){try{var h=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;h.classList.add(${JSON.stringify(
  JS_CLASS,
)});if(!sessionStorage.getItem(${JSON.stringify(PRELOADED_KEY)}))h.classList.add(${JSON.stringify(
  PRELOAD_CLASS,
)});setTimeout(function(){if(!h.classList.contains(${JSON.stringify(
  MOTION_CLASS,
)})){h.classList.remove(${JSON.stringify(JS_CLASS)},${JSON.stringify(PRELOAD_CLASS)})}},6000)}catch(e){}})();`;

export function MotionScript() {
  return <script id="pp-motion-init" dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
