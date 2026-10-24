export type Theme = "classified" | "declassified";

export const THEME_STORAGE_KEY = "onyx-theme";

/**
 * Runs in <head> before first paint so a returning guest never sees the wrong theme.
 * Defaults to CLASSIFIED (no attribute; system preference is deliberately ignored) and
 * never applies on admin or auth routes, which always keep the dark look.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=location.pathname;if(p.indexOf("/admin")===0||p.indexOf("/auth")===0)return;if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="declassified")document.documentElement.setAttribute("data-theme","declassified");}catch(e){}})();`;
