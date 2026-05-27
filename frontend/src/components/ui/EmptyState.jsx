export default function EmptyState({ title = "No data", description, icon = "📭" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-medium text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  );
}
