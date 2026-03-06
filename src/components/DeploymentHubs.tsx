import { useTranslation } from "react-i18next";

type Props = {
  hubs: { name: string; municipality: string; count: number }[];
};

export default function DeploymentHubs({ hubs }: Props) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-50">
        {t("Dashboard.deploymentHubs")}
      </h3>
      <div className="divide-y divide-neutral-400/20">
        {hubs.map((hub) => (
          <div
            key={hub.name}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="font-medium text-neutral-50">{hub.name}</p>
              <p className="text-sm text-neutral-400">{hub.municipality}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-50">{hub.count}</p>
              <p className="text-xs text-neutral-400/60">{t("Dashboard.deployments")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
