import type { AccentName } from "@/data/palette";
/** Manually maintained updates. Leave empty until an update is confirmed. */
export type Building = { project: string; description: string; learning: string; updated: string; link?: string; goals?: string };
export const CURRENTLY_BUILDING: Building | null = null;
export type Update = { date: string; title: string; description: string; category: string; accent?: AccentName; link?: string };
export const CHANGELOG: Update[] = [];

/** Entries use ISO dates (YYYY-MM-DD), which sort lexicographically. */
export const newestUpdates = (updates: readonly Update[]) => [...updates].sort((a, b) => b.date.localeCompare(a.date));
