"use client";

const KEY = "merged.mine.v1";

/**
 * The board itself is now shared, so local storage keeps only one cosmetic
 * fact: which handles this browser submitted, so they can be marked "you" in
 * the list. Nothing here affects ranking or is trusted by the server.
 */
export function loadMine(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function markMine(login: string) {
  const all = new Set(loadMine().map((l) => l.toLowerCase()));
  all.add(login.toLowerCase());
  window.localStorage.setItem(KEY, JSON.stringify([...all]));
}
