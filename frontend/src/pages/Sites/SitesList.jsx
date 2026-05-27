import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ErrorAlert from "../../components/ui/ErrorAlert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/format";
import SiteFormModal from "./SiteFormModal";

const SITE_STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  paused: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

const SITE_STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export default function SitesList() {
  const { isAdmin, isSiteManager } = useAuth();
  const canManage = isAdmin() || isSiteManager();

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/sites");
      setSites(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load sites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return sites;
    return sites.filter((s) => s.status === statusFilter);
  }, [sites, statusFilter]);

  const stats = useMemo(
    () => ({
      active: sites.filter((s) => s.status === "active").length,
      paused: sites.filter((s) => s.status === "paused").length,
      completed: sites.filter((s) => s.status === "completed").length,
    }),
    [sites]
  );

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (modal?.mode === "edit") {
        await api.patch(`/sites/${modal.site.id}`, payload);
      } else {
        await api.post("/sites", payload);
      }
      setModal(null);
      await fetchSites();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site) => {
    if (!confirm(`Delete "${site.name}"? This cannot be undone.`)) return;
    setActionId(site.id);
    try {
      await api.delete(`/sites/${site.id}`);
      await fetchSites();
    } catch (err) {
      alert(err.response?.data?.detail || "Cannot delete site");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading sites…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchSites} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Construction Sites</h2>
          <p className="text-sm text-slate-500">
            {isAdmin() ? "Manage all project sites" : "Your construction sites"} —{" "}
            {sites.length} total
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setModal({ mode: "add" })}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Add Site
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-2xl font-bold text-emerald-800">{stats.active}</p>
          <p className="text-sm text-emerald-600">Active</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-800">{stats.paused}</p>
          <p className="text-sm text-amber-600">Paused</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-2xl font-bold text-slate-700">{stats.completed}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
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
          title="No sites found"
          description={
            canManage
              ? "Add your first construction site using the map."
              : "No construction sites match this filter."
          }
          icon="🏗️"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((site) => (
            <article
              key={site.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800">{site.name}</h3>
                <StatusBadge
                  status={site.status}
                  styles={SITE_STATUS_STYLES}
                  labels={SITE_STATUS_LABELS}
                />
              </div>

              <p className="mt-2 flex-1 text-sm text-slate-600">{site.address}</p>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Coordinates</dt>
                  <dd className="font-mono text-xs text-slate-700">
                    {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                  </dd>
                </div>
                {site.site_manager && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Manager</dt>
                      <dd className="font-medium text-slate-800">
                        {site.site_manager.full_name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Phone</dt>
                      <dd className="text-slate-700">
                        {site.site_manager.phone || "—"}
                      </dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-slate-600">{formatDate(site.created_at)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <a
                  href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  View map
                </a>
                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", site })}
                      className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={actionId === site.id}
                      onClick={() => handleDelete(site)}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <SiteFormModal
          mode={modal.mode}
          site={modal.site}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
