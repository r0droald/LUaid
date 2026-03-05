type Props = {
  barangays: { name: string; municipality: string; beneficiaries: number }[];
};

export default function AidDistributionMap({ barangays }: Props) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Aid Distribution Map
        </h3>
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
          Live Map
        </span>
      </div>

      <div className="mb-6 flex h-48 items-center justify-center rounded-lg bg-gray-800/30">
        <p className="text-sm text-gray-500">
          Interactive map coming soon
        </p>
      </div>

      <div className="divide-y divide-gray-700/50">
        {barangays.map((brgy) => (
          <div
            key={`${brgy.name}-${brgy.municipality}`}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-300">
                Barangay {brgy.name}, {brgy.municipality}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-red-400">
                {brgy.beneficiaries.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-gray-500">beneficiaries</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
