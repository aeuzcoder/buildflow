import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ErrorAlert from "../../components/ui/ErrorAlert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../utils/orderStatus";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function OrdersList({ createPath = "/my-orders/new" }) {
  const { isSiteManager, isAdmin, isWarehouseManager } = useAuth();
  const [orders, setOrders] = useState([]);
  const [itemCounts, setItemCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders");
      setOrders(data);

      const counts = {};
      await Promise.all(
        data.slice(0, 50).map(async (order) => {
          try {
            const { data: detail } = await api.get(`/orders/${order.id}`);
            counts[order.id] = detail.items?.length ?? 0;
          } catch {
            counts[order.id] = null;
          }
        })
      );
      setItemCounts(counts);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/orders/${id}/approve`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this order?")) return;
    setActionLoading(id);
    try {
      await api.patch(`/orders/${id}/reject`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const canApprove = isAdmin() || isWarehouseManager();

  if (loading) return <LoadingSpinner label="Loading orders…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchOrders} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
          <p className="text-sm text-slate-500">{filtered.length} order(s)</p>
        </div>
        {isSiteManager() && (
          <Link
            to={createPath}
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + New Order
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === f.value
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            statusFilter === "all"
              ? "There are no orders yet."
              : `No orders with status "${ORDER_STATUS_LABELS[statusFilter]}".`
          }
          icon="📦"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Site</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-600 sm:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Items</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-brand-700">#{order.id}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {order.site?.name || `Site #${order.site_id}`}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {itemCounts[order.id] ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canApprove && order.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === order.id}
                            onClick={() => handleApprove(order.id)}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === order.id}
                            onClick={() => handleReject(order.id)}
                            className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
