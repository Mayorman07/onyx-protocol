"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "daylight" ? "daylight" : "covert";
}

// The server always renders COVERT; the client then reads what the <head> script applied.
function serverTheme(): Theme {
  return "covert";
}

/** Rubber-stamp switch between COVERT (dark) and DAYLIGHT (paper). Guest pages only. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme);
  const next: Theme = theme === "covert" ? "daylight" : "covert";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode, blocked): the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      className="theme-stamp"
      onClick={toggle}
      aria-label={`${theme} view. Switch to ${next} view.`}
      title={`Switch to ${next} view`}
    >
      {/* Keyed so the stamp "presses" again on each switch. */}
      <span key={theme} className="theme-stamp-ink">
        {theme}
      </span>
    </button>
  );
}
