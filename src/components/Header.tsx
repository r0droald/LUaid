import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="border-b border-neutral-400/20 bg-secondary">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-white">LUaid.org</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">🌐 English</span>
          <a
            href="#"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/80"
          >
            {t("Navigation.volunteer")}
          </a>
        </div>
      </div>
    </header>
  );
}
