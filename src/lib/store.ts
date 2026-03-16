"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/types";

import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import ar from "@/locales/ar.json";

const translations = { en, fr, ar } as const;

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

type TranslationKey = NestedKeyOf<typeof en>;

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: () => "ltr" | "rtl";
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "en" as Locale,
      setLocale: (locale: Locale) => set({ locale }),
      t: (key: TranslationKey) => {
        const { locale } = get();
        return getNestedValue(
          translations[locale] as unknown as Record<string, unknown>,
          key
        );
      },
      dir: () => {
        const { locale } = get();
        return locale === "ar" ? "rtl" : "ltr";
      },
    }),
    {
      name: "lagmed-locale",
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);
