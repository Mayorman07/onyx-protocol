"use client";

import { useEffect, useState } from "react";

type Segment = { text: string; cls: "k" | "g" };

const LINES: Segment[][] = [
  [{ text: "MISSION CODENAME: ", cls: "k" }, { text: "THE ONYX PROTOCOL", cls: "g" }],
  [{ text: "TARGET / HOST:    ", cls: "k" }, { text: "AGENT OMOTAYO", cls: "g" }],
  [{ text: "CLASSIFICATION:   ", cls: "k" }, { text: "RESTRICTED / LEVEL 30 ACCESS", cls: "g" }],
  [{ text: "STATUS:           ", cls: "k" }, { text: "TRANSMISSION DECRYPTED", cls: "g" }],
];

const CHAR_DELAY = 38;
const LINE_PAUSE = 350;

/** Cumulative character count at the end of each line. */
const LINE_ENDS = LINES.reduce<number[]>((ends, line) => {
  const length = line.reduce((sum, seg) => sum + seg.text.length, 0);
  return [...ends, (ends.at(-1) ?? 0) + length];
}, []);
const TOTAL = LINE_ENDS.at(-1) ?? 0;

export function Typewriter({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  // One extra tick past TOTAL so the final line gets its pause before the reveal.
  const done = count > TOTAL;

  useEffect(() => {
    if (done) {
      onDone();
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const pause = LINE_ENDS.includes(count) && count > 0 ? LINE_PAUSE : 0;
    const timer = setTimeout(() => setCount((c) => c + 1), (count === 0 ? 0 : reduce ? 0 : CHAR_DELAY) + pause);
    return () => clearTimeout(timer);
  }, [count, done, onDone]);

  return (
    <pre className={done ? "typed" : "typed cursor"} aria-live="polite">
      {renderTyped(count)}
    </pre>
  );
}

function renderTyped(count: number) {
  let remaining = count;
  return LINES.map((line, li) => {
    const segments = line.map((seg, si) => {
      const shown = seg.text.slice(0, Math.max(remaining, 0));
      remaining -= seg.text.length;
      return shown && <span key={si} className={seg.cls}>{shown}</span>;
    });
    const lineComplete = count >= LINE_ENDS[li];
    return (
      <span key={li}>
        {segments}
        {lineComplete && "\n"}
      </span>
    );
  });
}
