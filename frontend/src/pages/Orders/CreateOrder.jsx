import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import ErrorAlert from "../../components/ui/ErrorAlert";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatCurrency } from "../../utils/format";

export default function CreateOrder({ redirectPath = "/my-orders" }) {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [siteId, setSiteId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { material_id: "", quantity: "", search: "" },
  ]);

  const fetchFormData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sitesRes, materialsRes] = await Promise.all([
        api.get("/sites"),
        api.get("/materials"),
      ]);
      setSites(sitesRes.data);
      setMaterials(materialsRes.data);
      if (sitesRes.data.length > 0) {
        setSiteId(String(sitesRes.data[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load form data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const filteredMaterials = (search) => {
    const q = search.toLowerCase().trim();
    if (!q) return materials;
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  };

  const totalPrice = useMemo(() => {
    return lineItems.reduce((sum, line) => {
      const material = materials.find((m) => m.id === Number(line.material_id));
      const qty = Number(line.quantity);
      if (!material || !qty || qty <= 0) return sum;
      return sum + Number(material.price_per_unit) * qty;
    }, 0);
  }, [lineItems, materials]);

  const updateLine = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addLine = () => {
    setLineItems((prev) => [...prev, { material_id: "", quantity: "", search: "" }]);
  };

  const removeLine = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = lineItems
      .filter((l) => l.material_id && Number(l.quantity) > 0)
      .map((l) => ({
        material_id: Number(l.material_id),
        quantity: Number(l.quantity),
      }));

    if (!siteId || !deliveryDate || items.length === 0) {
      setError("Please select a site, delivery date, and at least one material.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/orders", {
        site_id: Number(siteId),
        delivery_date: new Date(deliveryDate).toISOString(),
        notes: notes || null,
        items,
      });
      navigate(redirectPath);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading form…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={redirectPath} className="text-sm text-brand-600 hover:underline">
          ← Back to orders
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800">New Order</h2>
        <p className="text-sm text-slate-500">Create an order for your construction site</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {sites.length === 0 ? (
        <ErrorAlert message="No construction sites assigned to you." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Construction Site
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Requested Delivery Date
            </label>
            <input
              type="datetime-local"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="Optional delivery instructions…"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Materials</h3>
              <button
                type="button"
                onClick={addLine}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                + Add material
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((line, index) => {
                const options = filteredMaterials(line.search);
                const selected = materials.find((m) => m.id === Number(line.material_id));

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end"
                  >
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-slate-500">Search material</label>
                      <input
                        type="text"
                        value={line.search}
                        onChange={(e) => updateLine(index, "search", e.target.value)}
                        placeholder="Type to search…"
                        className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <select
                        value={line.material_id}
                        onChange={(e) => updateLine(index, "material_id", e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select material</option>
                        {options.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.unit}) — {formatCurrency(m.price_per_unit)}
                          </option>
                        ))}
                      </select>
                      {selected && (
                        <p className="mt-1 text-xs text-slate-500">
                          Stock: {Number(selected.stock_quantity)} {selected.unit}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="mb-1 block text-xs text-slate-500">Quantity</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        required
                        value={line.quantity}
                        onChange={(e) => updateLine(index, "quantity", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-sm text-red-600 hover:underline sm:mb-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-slate-800">
              Total: <span className="text-brand-700">{formatCurrency(totalPrice)}</span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
