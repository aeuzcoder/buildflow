export const ORDER_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  in_transit: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const DELIVERY_STATUS_STYLES = {
  assigned: "bg-slate-100 text-slate-700",
  loading: "bg-amber-100 text-amber-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export const DELIVERY_NEXT_ACTION = {
  assigned: { status: "loading", label: "Start Loading" },
  loading: { status: "in_transit", label: "In Transit" },
  in_transit: { status: "delivered", label: "Delivered" },
};
