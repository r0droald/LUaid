import { getTranslations } from "next-intl/server";
import {
  getTotalDonations,
  getTotalBeneficiaries,
  getVolunteerCount,
  getDonationsByOrganization,
  getDeploymentHubs,
  getGoodsByCategory,
  getBeneficiariesByBarangay,
} from "@/lib/queries";
import Header from "@/components/Header";
import SummaryCards from "@/components/SummaryCards";
import DonationsByOrg from "@/components/DonationsByOrg";
import DeploymentHubs from "@/components/DeploymentHubs";
import GoodsByCategory from "@/components/GoodsByCategory";
import AidDistributionMap from "@/components/AidDistributionMap";
import StatusFooter from "@/components/StatusFooter";

export default async function DashboardPage() {
  const [
    t,
    totalDonations,
    totalBeneficiaries,
    volunteerCount,
    donationsByOrg,
    hubs,
    categories,
    barangays,
  ] = await Promise.all([
    getTranslations("Dashboard"),
    getTotalDonations(),
    getTotalBeneficiaries(),
    getVolunteerCount(),
    getDonationsByOrganization(),
    getDeploymentHubs(),
    getGoodsByCategory(),
    getBeneficiariesByBarangay(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-navy-950 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Hero */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {t("hero")}
            </h1>
            <p className="mt-2 text-gray-400">{t("subtitle")}</p>
          </div>

          {/* Summary Cards */}
          <SummaryCards
            totalDonations={totalDonations}
            totalBeneficiaries={totalBeneficiaries}
            volunteerCount={volunteerCount}
          />

          {/* Detail Sections */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DonationsByOrg donations={donationsByOrg} />
            <DeploymentHubs hubs={hubs} />
            <GoodsByCategory categories={categories} />
          </div>

          {/* Aid Distribution Map */}
          <div className="mt-8">
            <AidDistributionMap barangays={barangays} />
          </div>

          <StatusFooter />
        </div>
      </main>
    </>
  );
}
