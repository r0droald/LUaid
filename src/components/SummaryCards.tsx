import { useTranslation } from "react-i18next";

type Props = {
  totalDonations: number;
  totalBeneficiaries: number;
  volunteerCount: number;
};

export default function SummaryCards({
  totalDonations,
  totalBeneficiaries,
  volunteerCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          {t("Dashboard.totalDonations")}
        </p>
        <p className="mt-2 text-3xl font-bold text-success">
          ₱{totalDonations.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          {t("Dashboard.totalBeneficiaries")}
        </p>
        <p className="mt-2 text-3xl font-bold text-neutral-50">
          {totalBeneficiaries.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          {t("Dashboard.volunteerCount")}
        </p>
        <p className="mt-2 text-3xl font-bold text-neutral-50">
          {volunteerCount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
