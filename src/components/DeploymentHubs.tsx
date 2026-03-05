type Props = {
  hubs: { name: string; municipality: string; count: number }[];
};

export default function DeploymentHubs({ hubs }: Props) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-navy-900 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">
        Deployment Hubs
      </h3>
      <div className="divide-y divide-gray-700/50">
        {hubs.map((hub) => (
          <div
            key={hub.name}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="font-medium text-white">{hub.name}</p>
              <p className="text-sm text-gray-400">{hub.municipality}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{hub.count}</p>
              <p className="text-xs text-gray-500">deployments</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
