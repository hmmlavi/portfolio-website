/**
 * Central design palette — "Quiet Glass".
 *
 * Cool, spatially layered, low-saturation. The single warm note is the
 * signature reddish Contact accent; nothing is neon.
 *
 *   ice    — primary muted steel-blue accent (navigation, structure)
 *   violet — muted lavender (desktop / tooling)
 *   mint   — muted sage (success, library systems)
 *   rose   — the signature reddish Contact accent (reserved)
 *   amber  — warm brass (facilities, human-facing detail)
 *   teal   — deep teal (data, operations)
 *
 *   Six low-saturation hues form one complementary family. Each theme gets
 *   its own contrast-safe value, so colour variety never costs readability.
 *
 * Components resolve accents from here. Changing these six pairs
 * retunes the entire website in one place.
 *
 * ─────────────────────────── IMPORTANT ───────────────────────────
 * There are TWO different colour value shapes in this app:
 *
 *   1. AccentName — a palette KEY ("ice" | "violet" | "mint" | "rose").
 *      Resolved for the active theme by `accent()`.
 *   2. HexColor — a literal hex pair stored on content data
 *      (`color` for dark, `colorLight` for light). Resolved by `colorFor()`.
 *
 * Data in content.ts stores hex strings; it must NOT be passed to
 * `accent()` as if it were a palette key. ACCENT["#8fb3d1"] is undefined,
 * and reading `.dark` / `.light` from it crashes the whole render.
 * Both shapes are validated at runtime here so a bad value can never
 * produce an undefined lookup — but call sites still use the right API.
 */

export type Pair = { readonly dark: string; readonly light: string };

/** A literal CSS hex colour (3/4/6/8 digits; normalized to #rrggbb). */
export type HexColor = `#${string}`;

export const ACCENT = {
  ice:    { dark: "#8fb3d1", light: "#2d5f88" },
  violet: { dark: "#a49dc0", light: "#574b7c" },
  mint:   { dark: "#8fb9a5", light: "#2f6a54" },
  rose:   { dark: "#cf8b90", light: "#a33a48" },
  amber:  { dark: "#d8b27c", light: "#8a5a20" },
  teal:   { dark: "#7db4b0", light: "#1f6a66" },
} as const satisfies Record<string, Pair>;

export type AccentName = keyof typeof ACCENT;

/** Used whenever a value is missing or unrecognised — never `undefined`. */
export const DEFAULT_ACCENT: AccentName = "ice";

/** Rose used for primary Contact actions. */
export const ROSE: Pair = ACCENT.rose;

const ACCENT_NAMES = Object.keys(ACCENT) as AccentName[];

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Runtime validation for hex strings (the type alone cannot check the digits). */
export const isHexColor = (value: unknown): value is HexColor =>
  typeof value === "string" && HEX_RE.test(value.trim());

/** Expand shorthand hex and drop any alpha channel → always #rrggbb. */
export const normalizeHex = (value: unknown): HexColor | undefined => {
  if (!isHexColor(value)) return undefined;
  const body = value.trim().slice(1).toLowerCase();
  const rgb =
    body.length === 3 || body.length === 4
      ? body
          .slice(0, 3)
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : body.slice(0, 6);
  return `#${rgb}`;
};

/** Runtime validation for palette keys (guards untyped/JSON data as well). */
export const isAccentName = (value: unknown): value is AccentName =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(ACCENT, value);

/** A palette hex value (dark OR light variant) → its palette key. */
export const accentNameForHex = (value: unknown): AccentName | undefined => {
  const hex = normalizeHex(value);
  if (!hex) return undefined;
  return ACCENT_NAMES.find(
    (name) => ACCENT[name].dark === hex || ACCENT[name].light === hex,
  );
};

const pairFor = (value: unknown): Pair | undefined => {
  if (isAccentName(value)) return ACCENT[value];
  const name = accentNameForHex(value);
  return name ? ACCENT[name] : undefined;
};

/** Resolve any single value (key, palette hex or plain hex) for a theme. */
const resolveValue = (value: unknown, light: boolean): string | undefined => {
  const pair = pairFor(value);
  if (pair) return light ? pair.light : pair.dark;
  // A literal hex is already a valid CSS colour; accept it explicitly
  // instead of letting it become an undefined ACCENT lookup.
  return normalizeHex(value);
};

const fallback = (light: boolean): string => {
  const pair = ACCENT[DEFAULT_ACCENT];
  return light ? pair.light : pair.dark;
};

/**
 * Resolve an accent KEY for the active theme.
 *
 * The signature admits palette identifiers only (plus missing values), so
 * TypeScript rejects passing a content hex string here. At runtime, legacy
 * hex values are still resolved explicitly and unknown/missing values fall
 * back to `ice` — this function can never return `undefined` or throw.
 */
export const accent = (
  name: AccentName | null | undefined,
  light: boolean,
): string => resolveValue(name, light) ?? fallback(light);

export const rose = (light: boolean) => accent("rose", light);

/**
 * Resolve a content-data colour pair: `dark` is the dark-theme hex and
 * `lightColor` its readable light-theme counterpart. Both are validated;
 * if one is missing/invalid, the other is mapped back to its palette pair
 * so the returned colour is still correct for the ACTIVE theme. If both
 * are unusable, the default accent is returned.
 *
 * This is the correct API for every `color` / `colorLight` field in
 * content.ts (skills, projects, exploring, education, experience, …).
 */
export const colorFor = (
  dark: unknown,
  lightColor: unknown,
  light: boolean,
): string => {
  const preferred = resolveValue(light ? lightColor : dark, light);
  if (preferred) return preferred;
  const other = resolveValue(light ? dark : lightColor, light);
  return other ?? fallback(light);
};

/** Ordered cycle, for lists that need one accent per item. */
export const CYCLE: readonly AccentName[] = ["ice", "violet", "mint", "rose"];

/** Index-safe cycle (handles negative / non-finite indices). */
export const cycleAccent = (i: number, light: boolean) => {
  const len = CYCLE.length;
  const index = Number.isFinite(i)
    ? ((Math.trunc(i) % len) + len) % len
    : 0;
  return accent(CYCLE[index], light);
};

/** Hex → rgba helper, with a palette-coloured fallback for invalid input. */
export const alpha = (hex: unknown, a: number) => {
  const v = normalizeHex(hex) ?? fallback(false);
  const r = parseInt(v.slice(1, 3), 16);
  const g = parseInt(v.slice(3, 5), 16);
  const b = parseInt(v.slice(5, 7), 16);
  const opacity = Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 0;
  return `rgba(${r},${g},${b},${opacity})`;
};
