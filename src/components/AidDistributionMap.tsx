import DeploymentMap from "@/components/maps/DeploymentMap";

type DeploymentPoint = {
  lat: number;
  lng: number;
  quantity: number | null;
  unit: string | null;
  orgName: string;
  categoryName: string;
};

type Props = {
  barangays: { name: string; municipality: string; beneficiaries: number }[];
  deploymentPoints: DeploymentPoint[];
};

export default function AidDistributionMap({
  barangays,
  deploymentPoints,
}: Props) {
  return (
    <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-50">
          Aid Distribution Map
        </h3>
        <span className="rounded-full bg-error/20 px-3 py-1 text-xs font-medium text-error">
          Live Map
        </span>
      </div>

      {deploymentPoints.length > 0 ? (
        <div className="mb-6">
          <DeploymentMap points={deploymentPoints} />
        </div>
      ) : (
        <div className="mb-6 flex h-64 items-center justify-center rounded-lg bg-base/30">
          <p className="text-sm text-neutral-400/60">
            No deployment data available
          </p>
        </div>
      )}

      <div className="divide-y divide-neutral-400/20">
        {barangays.map((brgy) => (
          <div
            key={`${brgy.name}-${brgy.municipality}`}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-error"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-neutral-400">
                Barangay {brgy.name}, {brgy.municipality}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-error">
                {brgy.beneficiaries.toLocaleString()}
              </span>
              <span className="ml-1 text-xs text-neutral-400/60">
                beneficiaries
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
