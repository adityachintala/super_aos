// Hand-drawn style illustrations, as the inner markup of a 100 x 100 SVG.
// The wrapper (Doodle.astro / Doodle.svelte) sets the ink: no fill, a round 3px stroke
// in the current text colour. Fills use the sticky-note pastels from board.css.

const y = 'var(--note-yellow)';
const c = 'var(--note-coral)';
const t = 'var(--note-teal)';
const r = 'var(--note-rose)';
const o = 'var(--note-orange)';
const l = 'var(--note-lilac)';
const m = 'var(--note-mint)';

export const doodles = {
  // ----- small marks -----
  bulb: `<path d="M50 14c-15 0-26 11-26 25 0 9 5 16 11 21 3 3 4 6 4 10h22c0-4 1-7 4-10 6-5 11-12 11-21 0-14-11-25-26-25z" fill="${y}"/><path d="M40 79h20M43 88h14M50 7V2M19 20l-6-5M81 20l6-5M11 44H4M96 44h-7"/>`,
  star: `<path d="M50 10l11 25 27 3-20 18 6 27-24-14-24 14 6-27-20-18 27-3z" fill="${y}"/>`,
  eye: `<path d="M8 50c12-18 26-26 42-26s30 8 42 26c-12 18-26 26-42 26S20 68 8 50z" fill="${m}"/><circle cx="50" cy="50" r="13" fill="${y}"/><circle cx="50" cy="50" r="4" fill="currentColor"/>`,
  arrow: `<path d="M12 18c30 0 56 14 66 52M62 58l16 14 8-20"/>`,
  spark: `<path d="M50 10v22M50 68v22M10 50h22M68 50h22M24 24l13 13M63 63l13 13M76 24L63 37M37 63L24 76"/>`,
  coffee: `<path d="M20 40h46v24a18 18 0 01-18 18H38a18 18 0 01-18-18z" fill="${o}"/><path d="M66 46h8a9 9 0 010 18h-8M32 30c0-6 6-6 6-12M48 30c0-6 6-6 6-12M14 90h60"/>`,
  flag: `<path d="M22 90V12"/><path d="M22 16c18-10 30 10 56 0v34c-26 10-38-10-56 0z" fill="${c}"/>`,
  cards: `<rect x="14" y="26" width="52" height="38" rx="6" fill="${t}" transform="rotate(-8 40 45)"/><rect x="32" y="36" width="54" height="40" rx="6" fill="${y}"/><path d="M44 52h30M44 62h18"/>`,
  pencil: `<path d="M18 82l6-22 46-46 16 16-46 46z" fill="${y}"/><path d="M60 24l16 16M24 60l16 16M18 82l22-6"/>`,
  target: `<circle cx="48" cy="54" r="34" fill="${c}"/><circle cx="48" cy="54" r="21" fill="${y}"/><circle cx="48" cy="54" r="8" fill="${t}"/><path d="M48 54L88 14M74 14h14v14"/>`,

  // ----- one per lesson -----
  blocks: `<rect x="12" y="52" width="34" height="34" rx="5" fill="${c}"/><rect x="54" y="52" width="34" height="34" rx="5" fill="${t}"/><rect x="33" y="14" width="34" height="34" rx="5" fill="${y}"/>`,
  punchcard: `<path d="M24 24h64v52H12V36z" fill="${o}"/><path d="M26 40v6M38 40v6M50 52v6M62 40v6M74 52v6M32 62v6M56 62v6M68 40v6"/>`,
  chip: `<rect x="28" y="28" width="44" height="44" rx="6" fill="${l}"/><rect x="41" y="41" width="18" height="18" rx="3" fill="${y}"/><path d="M38 28V16M50 28V16M62 28V16M38 84V72M50 84V72M62 84V72M28 38H16M28 50H16M28 62H16M84 38H72M84 50H72M84 62H72"/>`,
  layers: `<path d="M50 12l38 17-38 17-38-17z" fill="${y}"/><path d="M12 48l38 17 38-17-12-5.5L50 54 24 42.5z" fill="${t}"/><path d="M12 67l38 17 38-17-12-5.5L50 73 24 61.5z" fill="${c}"/>`,
  talk: `<circle cx="20" cy="50" r="14" fill="${c}"/><circle cx="80" cy="50" r="14" fill="${t}"/><path d="M40 42h20M54 36l6 6-6 6M60 60H40M46 54l-6 6 6 6"/>`,
  threads: `<rect x="14" y="14" width="72" height="20" rx="6" fill="${r}"/><path d="M30 34c0 10 8 10 8 20s-8 10-8 20c0 5 4 8 4 12M50 34c0 10 8 10 8 20s-8 10-8 20c0 5 4 8 4 12M70 34c0 10 8 10 8 20s-8 10-8 20c0 5 4 8 4 12"/>`,
  stopwatch: `<circle cx="50" cy="58" r="30" fill="${y}"/><path d="M50 58V40M50 58l12 8M42 14h16M50 14v14M75 32l6-6"/>`,
  lock: `<rect x="22" y="44" width="56" height="42" rx="8" fill="${m}"/><path d="M34 44V32a16 16 0 0132 0v12M50 66v8"/><circle cx="50" cy="62" r="5" fill="currentColor"/>`,
  gridlock: `<circle cx="50" cy="50" r="13" fill="${c}"/><path d="M24 24h44M60 16l8 8-8 8M76 24v44M68 60l8 8 8-8M76 76H32M40 68l-8 8 8 8M24 76V32M16 40l8-8 8 8M45 45l10 10M55 45L45 55"/>`,
  link: `<rect x="8" y="24" width="30" height="22" rx="4" fill="${t}"/><rect x="62" y="24" width="30" height="22" rx="4" fill="${y}"/><path d="M23 46v10M77 46v10M14 56h18M68 56h18M23 56c0 30 54 30 54 0"/>`,
  route: `<path d="M20 74L44 44l32 16 6-36M44 44l6-26"/><circle cx="20" cy="74" r="8" fill="${c}"/><circle cx="44" cy="44" r="8" fill="${y}"/><circle cx="76" cy="60" r="8" fill="${t}"/><circle cx="82" cy="24" r="8" fill="${l}"/><circle cx="50" cy="18" r="6" fill="${m}"/>`,
  parcel: `<rect x="10" y="24" width="76" height="50" rx="6" fill="${o}"/><path d="M10 30l38 26 38-26"/><circle cx="76" cy="72" r="14" fill="${m}"/><path d="M69 72l5 6 9-10"/>`,
  memgrid: `<rect x="16" y="16" width="68" height="68" rx="6" fill="${l}"/><rect x="16" y="16" width="22.6" height="22.6" fill="${y}"/><rect x="61.4" y="38.6" width="22.6" height="22.8" fill="${c}"/><rect x="38.6" y="61.4" width="22.8" height="22.6" fill="${t}"/><path d="M16 38.6h68M16 61.4h68M38.6 16v68M61.4 16v68"/>`,
  swap: `<rect x="8" y="30" width="30" height="40" rx="5" fill="${y}"/><path d="M8 44h30M8 56h30"/><path d="M61 34v32c0 8 30 8 30 0V34z" fill="${t}"/><ellipse cx="76" cy="34" rx="15" ry="6" fill="${t}"/><path d="M44 42h11M51 38l4 4-4 4M55 60H44M48 56l-4 4 4 4"/>`,
  disk: `<circle cx="46" cy="54" r="34" fill="${l}"/><circle cx="46" cy="54" r="8" fill="${y}"/><path d="M88 14L60 46"/><circle cx="88" cy="14" r="5" fill="currentColor"/>`,
  folder: `<path d="M10 26h28l8 10h44v44H10z" fill="${y}"/><path d="M26 56h48M26 68h32"/>`,
  racks: `<rect x="10" y="20" width="22" height="60" rx="4" fill="${t}"/><rect x="39" y="20" width="22" height="60" rx="4" fill="${y}"/><rect x="68" y="20" width="22" height="60" rx="4" fill="${c}"/><path d="M15 34h12M15 46h12M15 58h12M44 34h12M44 46h12M44 58h12M73 34h12M73 46h12M73 58h12"/>`,
  funnel: `<path d="M10 24h80L60 56v24l-20 10V56z" fill="${o}"/><circle cx="28" cy="11" r="4" fill="currentColor"/><circle cx="50" cy="9" r="4" fill="currentColor"/><circle cx="72" cy="11" r="4" fill="currentColor"/>`,
  cloud: `<path d="M28 70a16 16 0 01-2-32 22 22 0 0142-6 19 19 0 014 38z" fill="${t}"/><path d="M36 84v-6M50 90v-12M64 84v-6"/>`,
  nested: `<rect x="8" y="12" width="84" height="60" rx="6" fill="${l}"/><rect x="18" y="24" width="36" height="28" rx="4" fill="${y}"/><rect x="60" y="24" width="22" height="18" rx="3" fill="${c}"/><path d="M34 88h32M50 72v16"/>`,
} as const;

export type DoodleName = keyof typeof doodles;
