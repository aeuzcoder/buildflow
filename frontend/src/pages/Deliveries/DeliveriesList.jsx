import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ErrorAlert from "../../components/ui/ErrorAlert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../utils/format";
import {
  DELIVERY_NEXT_ACTION,
  DELIVERY_STATUS_STYLES,
} from "../../utils/orderStatus";

const DELIVERY_LABELS = {
  assigned: "Assigned",
  loading: "Loading",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
};

export default function DeliveriesList() {
  const { isDriver } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/deliveries");
      setDeliveries(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleStatusUpdate = async (deliveryId, nextStatus) => {
    setUpdatingId(deliveryId);
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: nextStatus });
      await fetchDeliveries();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading deliveries…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDeliveries} />;

  const driverView = isDriver();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {driverView ? "My Deliveries" : "Deliveries"}
        </h2>
        <p className="text-sm text-slate-500">{deliveries.length} delivery(ies)</p>
      </div>

      {deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries"
          description={
            driverView
              ? "You have no assigned deliveries yet."
              : "No deliveries in the system."
          }
          icon="🚚"
        />
      ) : driverView ? (
        <div className="grid gap-4 md:grid-cols-2">
          {deliveries.map((delivery) => {
            const next = DELIVERY_NEXT_ACTION[delivery.status];
            const address =
              delivery.order?.site?.address ||
              delivery.order?.site?.name ||
              `Order #${delivery.order_id}`;

            return (
              <div
                key={delivery.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-brand-800">
                      Order #{delivery.order_id}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{address}</p>
                  </div>
                  <StatusBadge
                    status={delivery.status}
                    styles={DELIVERY_STATUS_STYLES}
                    labels={DELIVERY_LABELS}
                  />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-slate-500">Scheduled</dt>
                    <dd className="font-medium">{formatDateTime(delivery.scheduled_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Vehicle</dt>
                    <dd className="font-medium">{delivery.vehicle_number}</dd>
                  </div>
                </dl>

                {delivery.notes && (
                  <p className="mt-3 text-sm text-slate-500">{delivery.notes}</p>
                )}

                {next && (
                  <button
                    type="button"
                    disabled={updatingId === delivery.id}
                    onClick={() => handleStatusUpdate(delivery.id, next.status)}
                    className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                  >
                    {updatingId === delivery.id ? "Updating…" : next.label}
                  </button>
                )}

                {delivery.status === "delivered" && delivery.delivered_at && (
                  <p className="mt-2 text-center text-xs text-emerald-600">
                    Delivered {formatDateTime(delivery.delivered_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Order</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Destination</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Scheduled</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">#{d.id}</td>
                  <td className="px-4 py-3">#{d.order_id}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {d.order?.site?.name || "—"}
                    <span className="block text-xs text-slate-400">
                      {d.order?.site?.address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(d.scheduled_at)}</td>
                  <td className="px-4 py-3">{d.vehicle_number}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={d.status}
                      styles={DELIVERY_STATUS_STYLES}
                      labels={DELIVERY_LABELS}
                    />
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
