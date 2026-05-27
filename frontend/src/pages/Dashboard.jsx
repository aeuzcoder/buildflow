import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";
import ErrorAlert from "../components/ui/ErrorAlert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StatCard from "../components/ui/StatCard";
import { formatCurrency } from "../utils/format";
import { ORDER_STATUS_LABELS } from "../utils/orderStatus";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#ef4444", "#f97316", "#10b981", "#94a3b8"];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildOrdersByStatus(orders) {
  const counts = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, value]) => ({
    name: ORDER_STATUS_LABELS[status] || status,
    value,
    status,
  }));
}

function buildDeliveriesByWeek(deliveries) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({
      date: d,
      label: DAY_LABELS[d.getDay()],
      count: 0,
    });
  }

  deliveries.forEach((del) => {
    const scheduled = new Date(del.scheduled_at);
    if (scheduled >= weekAgo) {
      const bucket = buckets.find(
        (b) => b.date.toDateString() === scheduled.toDateString()
      );
      if (bucket) bucket.count += 1;
    }
  });

  return buckets.map(({ label, count }) => ({ day: label, deliveries: count }));
}

export default function Dashboard() {
  const { isAdmin, isWarehouseManager, isSiteManager } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canChartOrders =
    isAdmin() || isWarehouseManager() || isSiteManager();
  const canChartDeliveries = isAdmin();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const requests = [api.get("/dashboard/stats")];
      if (canChartOrders) requests.push(api.get("/orders"));
      if (canChartDeliveries) requests.push(api.get("/deliveries"));

      const results = await Promise.all(requests);
      setDashboard(results[0].data);
      let idx = 1;
      if (canChartOrders) {
        setOrders(results[idx].data);
        idx += 1;
      }
      if (canChartDeliveries) {
        setDeliveries(results[idx].data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [canChartOrders, canChartDeliveries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pieData = useMemo(() => buildOrdersByStatus(orders), [orders]);
  const barData = useMemo(() => buildDeliveriesByWeek(deliveries), [deliveries]);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  const { role, stats } = dashboard || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-500">Overview for your role</p>
      </div>

      {role === ROLES.ADMIN && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Orders" value={stats.total_orders} icon="📦" />
            <StatCard
              title="Today's Deliveries"
              value={stats.deliveries_today}
              icon="🚚"
              accent="amber"
            />
            <StatCard title="Active Sites" value={stats.active_sites} icon="🏗️" accent="emerald" />
            <StatCard
              title="Low Stock Alerts"
              value={stats.low_stock_materials?.length ?? 0}
              icon="⚠️"
              accent="red"
              subtitle="Materials below threshold"
            />
          </div>

          {stats.low_stock_materials?.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Low stock materials</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {stats.low_stock_materials.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-full bg-white px-3 py-1 text-xs text-red-700 shadow-sm"
                  >
                    {m.name} ({m.unit})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Orders by Status">
              {pieData.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">No order data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Deliveries This Week">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {role === ROLES.WAREHOUSE_MANAGER && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Pending Approvals" value={stats.pending_approvals} icon="⏳" accent="amber" />
            <StatCard
              title="In Transit"
              value={stats.in_transit_deliveries}
              icon="🚚"
              accent="brand"
            />
            <StatCard
              title="Stock Alerts"
              value={stats.stock_alerts?.length ?? 0}
              icon="⚠️"
              accent="red"
            />
          </div>
          {pieData.length > 0 && (
            <ChartCard title="Orders by Status">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}

      {role === ROLES.DRIVER && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard title="Deliveries Today" value={stats.my_deliveries_today} icon="🚚" />
          <StatCard
            title="Completed This Week"
            value={stats.completed_this_week}
            icon="✅"
            accent="emerald"
          />
        </div>
      )}

      {role === ROLES.SITE_MANAGER && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard title="Pending Orders" value={stats.my_pending_orders} icon="📋" accent="amber" />
            <StatCard
              title="Active Deliveries"
              value={stats.active_deliveries_to_my_sites}
              icon="🚚"
            />
          </div>
          {pieData.length > 0 && (
            <ChartCard title="My Orders by Status">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}
