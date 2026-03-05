"use client";

import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="border-b border-gray-800 bg-navy-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-white">LUaid.org</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">🌐 English</span>
          <a
            href="#"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            {t("volunteer")}
          </a>
        </div>
      </div>
    </header>
  );
}
