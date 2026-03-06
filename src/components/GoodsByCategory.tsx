type Props = {
  categories: { name: string; icon: string | null; total: number }[];
};

const FALLBACK_ICONS: Record<string, string> = {
  "Water Filtration": "💧",
  "Meals": "🍽️",
  "Relief Goods": "📦",
  "Construction Materials": "🏗️",
  "Cleaning Supplies": "🧹",
  "Drinking Water": "🚰",
  "Kiddie Packs": "🎒",
};

export default function GoodsByCategory({ categories }: Props) {
  return (
    <div className="rounded-xl border border-neutral-400/20 bg-secondary p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-50">
        Goods Purchased
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="rounded-lg bg-base/50 p-4 text-center"
          >
            <p className="text-2xl">
              {cat.icon || FALLBACK_ICONS[cat.name] || "📋"}
            </p>
            <p className="mt-1 text-sm text-neutral-400">{cat.name}</p>
            <p className="mt-1 text-lg font-bold text-neutral-50">
              {cat.total.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
