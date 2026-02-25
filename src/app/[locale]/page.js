import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("App");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-lg text-gray-400">{t("description")}</p>
    </main>
  );
}
