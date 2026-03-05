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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Total Donations
        </p>
        <p className="mt-2 text-3xl font-bold text-emerald-400">
          ₱{totalDonations.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Total Beneficiaries
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {totalBeneficiaries.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Volunteer Count
        </p>
        <p className="mt-2 text-3xl font-bold text-white">
          {volunteerCount.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
