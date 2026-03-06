import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("App.title")}</h1>
      <p className="mt-4 text-lg text-gray-400">{t("App.description")}</p>
    </main>
  );
}
