"use client";

import { useLocaleStore } from "@/lib/store";
import type { Locale } from "@/lib/types";

const languages: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "عربي" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
            locale === lang.code
              ? "bg-navy-600 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
