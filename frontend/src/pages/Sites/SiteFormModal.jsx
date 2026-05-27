import { useEffect, useState } from "react";
import api from "../../services/api";
import LocationMap from "../../components/maps/LocationMap";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const emptyForm = {
  name: "",
  address: "",
  latitude: null,
  longitude: null,
  site_manager_id: "",
  status: "active",
};

export default function SiteFormModal({ mode, site, saving, onClose, onSave }) {
  const { isAdmin, user } = useAuth();
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptyForm);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (isEdit && site) {
      setForm({
        name: site.name || "",
        address: site.address || "",
        latitude: site.latitude,
        longitude: site.longitude,
        site_manager_id: String(site.site_manager_id || ""),
        status: site.status || "active",
      });
    } else {
      setForm({
        ...emptyForm,
        site_manager_id: isAdmin() ? "" : String(user?.id || ""),
      });
    }
  }, [isEdit, site, user]);

  useEffect(() => {
    if (!isAdmin()) return;
    api
      .get("/users")
      .then(({ data }) => {
        setManagers(data.filter((u) => u.role === "site_manager" && u.is_active));
      })
      .catch(() => setManagers([]));
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapSelect = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lng * 10000) / 10000,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.latitude == null || form.longitude == null) {
      alert("Please select a location on the map");
      return;
    }

    const payload = {
      name: form.name,
      address: form.address,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      status: form.status,
    };

    if (isAdmin()) {
      payload.site_manager_id = Number(form.site_manager_id);
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit construction site" : "Add construction site"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Click the map to pin the site location
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <LocationMap
            latitude={form.latitude}
            longitude={form.longitude}
            onLocationSelect={handleMapSelect}
          />

          {form.latitude != null && (
            <p className="text-center font-mono text-xs text-slate-500">
              {form.latitude}, {form.longitude}
            </p>
          )}

          <input
            name="name"
            required
            placeholder="Site name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />

          <textarea
            name="address"
            required
            rows={2}
            placeholder="Full address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {isAdmin() && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Site manager
              </label>
              <select
                name="site_manager_id"
                required
                value={form.site_manager_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              >
                <option value="">Select site manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Update site" : "Create site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
