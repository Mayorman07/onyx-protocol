// Two visual treatments of the same classified file: COVERT (dark, default) and DAYLIGHT (paper).
export type Theme = "covert" | "daylight";

export const THEME_STORAGE_KEY = "onyx-theme";

/**
 * Runs in <head> before first paint so a returning guest never sees the wrong theme.
 * Defaults to COVERT (no attribute; system preference is deliberately ignored) and
 * never applies on admin or auth routes, which always keep the dark look.
 * "declassified" is the light theme's former name, honoured so earlier choices carry over.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname;if(p.indexOf("/admin")===0||p.indexOf("/auth")===0)return;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="daylight"||t==="declassified")document.documentElement.setAttribute("data-theme","daylight");}catch(e){}})();`;
