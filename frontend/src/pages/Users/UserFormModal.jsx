import { useEffect, useState } from "react";
import { ROLE_LABELS, ROLES } from "../../utils/roles";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

const emptyForm = {
  email: "",
  password: "",
  full_name: "",
  role: ROLES.SITE_MANAGER,
  is_active: true,
  phone: "",
  contact_email: "",
  address: "",
  city: "",
  company: "",
  notes: "",
};

export default function UserFormModal({ mode, user, saving, onClose, onSave }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (isEdit && user) {
      setForm({
        email: user.email || "",
        password: "",
        full_name: user.full_name || "",
        role: user.role,
        is_active: user.is_active,
        phone: user.phone || "",
        contact_email: user.contact_email || "",
        address: user.address || "",
        city: user.city || "",
        company: user.company || "",
        notes: user.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [isEdit, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && (!form.password || form.password.length < 8)) {
      alert("Password must be at least 8 characters");
      return;
    }
    const payload = { ...form, contact_email: form.contact_email || null };
    if (isEdit && !payload.password) delete payload.password;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit user" : "Add user"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            name="full_name"
            required
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Login email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            placeholder={isEdit ? "New password (leave blank to keep)" : "Password (min 8)"}
            minLength={isEdit ? 0 : 8}
            required={!isEdit}
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active account
            </label>
          )}
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="contact_email"
            type="email"
            placeholder="Contact email (optional)"
            value={form.contact_email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

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
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
