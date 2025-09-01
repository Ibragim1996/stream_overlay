// lib/locale.ts
import type { NextRequest } from "next/server";

export const SUPPORTED_LOCALES = ["en", "ru", "es"] as const;
export type Lang = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Lang = "en";

export function bestFromHeader(accept: string | null): Lang {
  const str = (accept || "").toLowerCase();
  for (const cand of ["en", "ru", "es"]) {
    if (str.includes(cand)) return cand as Lang;
  }
  // иногда приходят en-US, ru-RU и т.п.
  if (/ru/i.test(str)) return "ru";
  if (/es/i.test(str)) return "es";
  return "en";
}

export function detectRequestLang(req: NextRequest): Lang {
  const q = req.nextUrl.searchParams.get("lg");
  if (q && SUPPORTED_LOCALES.includes(q as Lang)) return q as Lang;

  const c = req.cookies.get("locale")?.value;
  if (c && SUPPORTED_LOCALES.includes(c as Lang)) return c as Lang;

  return bestFromHeader(req.headers.get("accept-language"));
}