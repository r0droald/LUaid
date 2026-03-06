import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { supportedLocales, type Locale } from "../i18n";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fil: "Filipino",
  ilo: "Ilocano",
};

export default function Header() {
  const { t } = useTranslation();
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    navigate(`/${e.target.value}`);
  };

  return (
    <header className="border-b border-neutral-400/20 bg-secondary">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-white">LUaid.org</span>
        <div className="flex items-center gap-4">
          <select
            value={locale}
            onChange={handleLocaleChange}
            className="rounded-lg border border-neutral-400/20 bg-secondary px-3 py-1.5 text-sm text-neutral-400"
          >
            {supportedLocales.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>
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
