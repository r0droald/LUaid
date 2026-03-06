import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import DonationsByOrg from "@/components/DonationsByOrg";
import DeploymentHubs from "@/components/DeploymentHubs";
import GoodsByCategory from "@/components/GoodsByCategory";
import AidDistributionMap from "@/components/AidDistributionMap";
import StatusFooter from "@/components/StatusFooter";
import {
  getTotalDonations,
  getTotalBeneficiaries,
  getVolunteerCount,
  getDonationsByOrganization,
  getDeploymentHubs,
  getGoodsByCategory,
  getBeneficiariesByBarangay,
} from "@/lib/queries";

type DashboardData = {
  totalDonations: number;
  totalBeneficiaries: number;
  volunteerCount: number;
  donationsByOrg: { name: string; amount: number }[];
  deploymentHubs: { name: string; municipality: string; count: number }[];
  goodsByCategory: { name: string; icon: string | null; total: number }[];
  barangays: { name: string; municipality: string; beneficiaries: number }[];
};

export function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        totalDonations,
        totalBeneficiaries,
        volunteerCount,
        donationsByOrg,
        deploymentHubs,
        goodsByCategory,
        barangays,
      ] = await Promise.all([
        getTotalDonations(),
        getTotalBeneficiaries(),
        getVolunteerCount(),
        getDonationsByOrganization(),
        getDeploymentHubs(),
        getGoodsByCategory(),
        getBeneficiariesByBarangay(),
      ]);

      setData({
        totalDonations,
        totalBeneficiaries,
        volunteerCount,
        donationsByOrg,
        deploymentHubs,
        goodsByCategory,
        barangays,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">{t("Dashboard.loading")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-error">{t("Dashboard.loadError")}</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/80"
        >
          {t("Dashboard.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <SummaryCards
          totalDonations={data.totalDonations}
          totalBeneficiaries={data.totalBeneficiaries}
          volunteerCount={data.volunteerCount}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DonationsByOrg donations={data.donationsByOrg} />
          <DeploymentHubs hubs={data.deploymentHubs} />
        </div>
        <GoodsByCategory categories={data.goodsByCategory} />
        <AidDistributionMap barangays={data.barangays} />
      </main>
      <StatusFooter />
    </div>
  );
}
