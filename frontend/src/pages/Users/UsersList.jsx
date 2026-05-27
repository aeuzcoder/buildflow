import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import ErrorAlert from "../../components/ui/ErrorAlert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ROLE_LABELS } from "../../utils/roles";
import { formatDate } from "../../utils/format";
import UserFormModal from "./UserFormModal";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal?.mode === "edit") {
        await api.patch(`/users/${modal.user.id}`, formData);
      } else {
        await api.post("/users", formData);
      }
      setModal(null);
      await fetchUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user) => {
    if (!confirm(`Deactivate ${user.full_name}?`)) return;
    setActionId(user.id);
    try {
      await api.patch(`/users/${user.id}/deactivate`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Permanently delete ${user.full_name}? This cannot be undone.`)) return;
    setActionId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Cannot delete user");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading users…" />;
  if (error) return <ErrorAlert message={error} onRetry={fetchUsers} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Admin: add, edit, deactivate, or delete users</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "add" })}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Add User
        </button>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users" description="No users found." icon="👥" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-600 md:table-cell">
                  Phone
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-600 sm:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{user.full_name}</p>
                    {user.company && (
                      <p className="text-xs text-slate-400">{user.company}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {user.phone || "—"}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", user })}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      {user.is_active && (
                        <button
                          type="button"
                          disabled={actionId === user.id}
                          onClick={() => handleDeactivate(user)}
                          className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionId === user.id}
                        onClick={() => handleDelete(user)}
                        className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
