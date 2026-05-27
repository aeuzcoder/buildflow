import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "../../utils/orderStatus";

export default function StatusBadge({ status, styles = ORDER_STATUS_STYLES, labels = ORDER_STATUS_LABELS }) {
  const style = styles[status] || "bg-slate-100 text-slate-600";
  const label = labels[status] || status?.replace(/_/g, " ");

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
