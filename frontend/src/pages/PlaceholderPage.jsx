export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}
