type Props = {
  donations: { name: string; amount: number }[];
};

const BAR_COLORS = [
  "bg-blue-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-amber-500",
];

export default function DonationsByOrg({ donations }: Props) {
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Donations Received per Organization
      </h3>
      <div className="space-y-4">
        {donations.map((org, i) => {
          const pct = total > 0 ? (org.amount / total) * 100 : 0;
          return (
            <div key={org.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{org.name}</span>
                <span className="text-gray-500">{pct.toFixed(0)}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-800">
                <div
                  className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-sm text-emerald-400">
                ₱{org.amount.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
