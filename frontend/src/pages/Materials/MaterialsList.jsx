import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ErrorAlert from "../../components/ui/ErrorAlert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

const LOW_STOCK = 100;

export default function MaterialsList() {
  const { isAdmin, isWarehouseManager, isSupplier } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const canManage = isAdmin() || isWarehouseManager();
  const canAdd = canManage || isSupplier();
  const canEditStock = canManage || isSupplier();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/materials");
      setMaterials(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal?.mode === "edit") {
        await api.patch(`/materials/${modal.material.id}`, formData);
      } else {
        await api.post("/materials", formData);
      }
      setModal(null);
      await fetchMaterials();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading materials…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchMaterials} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Materials</h2>
          <p className="text-sm text-slate-500">{materials.length} material(s)</p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ mode: "add" })}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Add Material
          </button>
        )}
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title="No materials"
          description="No materials have been added yet."
          icon="🧱"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => {
              const lowStock = Number(m.stock_quantity) < LOW_STOCK;
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{m.name}</h3>
                    {lowStock && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Low stock
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{m.category}</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Stock</dt>
                      <dd className={`font-medium ${lowStock ? "text-red-600" : "text-slate-800"}`}>
                        {Number(m.stock_quantity)} {m.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Price / {m.unit}</dt>
                      <dd className="font-medium text-brand-700">
                        {formatCurrency(m.price_per_unit)}
                      </dd>
                    </div>
                  </dl>
                  {canEditStock && (
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", material: m })}
                      className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit Stock
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Price</th>
                  {canEditStock && (
                    <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => {
                  const lowStock = Number(m.stock_quantity) < LOW_STOCK;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{m.name}</span>
                        {lowStock && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.category}</td>
                      <td className="px-4 py-3 text-right">
                        {Number(m.stock_quantity)} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-brand-700">
                        {formatCurrency(m.price_per_unit)}
                      </td>
                      {canEditStock && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setModal({ mode: "edit", material: m })}
                            className="text-sm font-medium text-brand-600 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <MaterialModal
          mode={modal.mode}
          material={modal.material}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
          showSupplierField={canManage && modal.mode === "add"}
        />
      )}
    </div>
  );
}

function MaterialModal({ mode, material, saving, onClose, onSave, showSupplierField }) {
  const [form, setForm] = useState({
    name: material?.name || "",
    unit: material?.unit || "kg",
    category: material?.category || "",
    price_per_unit: material?.price_per_unit || "",
    stock_quantity: material?.stock_quantity || "",
    supplier_id: "",
  });

  const isEdit = mode === "edit";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      onSave({ stock_quantity: Number(form.stock_quantity) });
    } else {
      onSave({
        name: form.name,
        unit: form.unit,
        category: form.category,
        price_per_unit: Number(form.price_per_unit),
        stock_quantity: Number(form.stock_quantity) || 0,
        ...(showSupplierField && form.supplier_id
          ? { supplier_id: Number(form.supplier_id) }
          : {}),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit Stock" : "Add Material"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {!isEdit && (
            <>
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Unit (kg, m3, dona…)"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Price per unit"
                value={form.price_per_unit}
                onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {showSupplierField && (
                <input
                  type="number"
                  placeholder="Supplier ID"
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              )}
            </>
          )}
          <div>
            <label className="mb-1 block text-sm text-slate-600">Stock quantity</label>
            <input
              required
              type="number"
              min="0"
              step="any"
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
