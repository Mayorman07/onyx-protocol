type Bar = { width: number; gap: number };

/** Turns a string into a stable pattern of bar widths (decorative, not a scannable symbology). */
function barsFor(value: string): Bar[] {
  const guard: Bar[] = [
    { width: 2, gap: 1 },
    { width: 1, gap: 2 },
  ];
  const body = Array.from(value).flatMap((char) => {
    const code = char.charCodeAt(0);
    return [
      { width: 1 + (code % 3), gap: 1 + ((code >> 2) % 2) },
      { width: 1 + ((code >> 3) % 2), gap: 1 + (code % 2) },
    ];
  });
  return [...guard, ...body, ...guard];
}

/** A pure-CSS barcode motif encoding `value`. Hidden from screen readers; pair it with a visible label. */
export function Barcode({ value }: { value: string }) {
  return (
    <span className="barcode" aria-hidden="true">
      {barsFor(value).map((bar, i) => (
        <i key={i} style={{ width: bar.width, marginRight: bar.gap }} />
      ))}
    </span>
  );
}
