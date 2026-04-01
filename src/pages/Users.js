import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUsers } from "../api/user";
import { editUser } from "../api/editUser";
import { getTenants } from "../api/tenants";
import { createUser } from "../api/createUser";

export default function Users({ token }) {
  const [filterTenants, setFilterTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [modifiedUsers, setModifiedUsers] = useState({});
  const loggedUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [showModal, setShowModal] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantIds: [],
    is_active: true,
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(token);
        setUsers(data);
      } catch (err) {
        setError(err);
      }
    }
    fetchUsers();
  }, [token]);

  // Llamada a tenants al abrir el modal
  useEffect(() => {
    if (showModal) {
      setModalLoading(true);
      setModalError("");
      getTenants(token)
        .then((data) => {
          setTenants(data);
          setModalLoading(false);
        })
        .catch((err) => {
          setModalError("Error al cargar tenants");
          setModalLoading(false);
        });
    } else {
      setModalError("");
      // Si no hay tenants cargados, los obtenemos de los usuarios
      if (tenants.length === 0 && users.length > 0) {
        // Extraer tenants únicos de los usuarios
        const allTenants = users.flatMap(u => u.tenants);
        const uniqueTenants = [];
        const ids = new Set();
        for (const t of allTenants) {
          if (!ids.has(t.id)) {
            ids.add(t.id);
            uniqueTenants.push(t);
          }
        }
        setTenants(uniqueTenants);
      }
    }
  }, [showModal, token, users]);

  const handleActiveChange = (id, value) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: value } : u));
    setModifiedUsers((prev) => ({ ...prev, [id]: true }));
  };

  const handleSave = async (user) => {
    try {
      await editUser(token, user.id, {
        email: user.email,
        is_active: user.is_active,
        is_superadmin: user.is_superadmin,
      });
      setModifiedUsers((prev) => ({ ...prev, [user.id]: false }));
      // Opcional: feedback visual
    } catch (err) {
      setError(err);
    }
  };

  // Modal submit handler
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!form.username || !form.email || !form.password || !form.confirmPassword || form.tenantIds.length === 0) {
      setModalError("Todos los campos son obligatorios.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setModalError("Las contraseñas no coinciden.");
      return;
    }
    setModalLoading(true);
    try {
      await createUser(token, {
        username: form.username,
        email: form.email,
        password: form.password,
        tenant_ids: form.tenantIds,
        is_active: form.is_active,
      });
      setShowModal(false);
      // Refresh users
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      setModalError(err);
    }
    setModalLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6 bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <span className="text-lg font-bold mr-4">Filtros:</span>
          <div className="min-w-[220px]">
            <Select
              isMulti
              options={tenants.map(t => ({ value: t.id, label: t.name }))}
              value={filterTenants}
              onChange={selected => setFilterTenants(selected)}
              placeholder="Filtrar por tenants..."
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          Crear nuevo usuario
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{String(error)}</div>}

      {/* Modal for creating user */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Crear nuevo usuario</h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                <input type="password" className="w-full border rounded px-3 py-2" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenants</label>
                {modalLoading ? (
                  <div className="text-gray-500">Cargando tenants...</div>
                ) : tenants.length > 0 ? (
                  <Select
                    isMulti
                    options={tenants.map(t => ({ value: t.id, label: t.name }))}
                    value={tenants.filter(t => form.tenantIds.includes(String(t.id)) || form.tenantIds.includes(t.id)).map(t => ({ value: t.id, label: t.name }))}
                    onChange={selected => {
                      setForm(f => ({ ...f, tenantIds: selected.map(s => String(s.value)) }));
                    }}
                    placeholder="Selecciona uno o varios tenants..."
                    classNamePrefix="react-select"
                  />
                ) : (
                  <div className="text-red-500">No hay tenants disponibles</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label className="text-sm">Activo</label>
              </div>
              {modalError && <div className="text-red-500 text-sm">{modalError}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" disabled={modalLoading}>
                {modalLoading ? "Creando..." : "Crear usuario"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users
          .filter(user => {
            if (filterTenants.length === 0) return true;
            const userTenantIds = user.tenants.map(t => String(t.id));
            return filterTenants.some(ft => userTenantIds.includes(String(ft.value)));
          })
          .map((user) => (
            <div key={user.id} className="bg-white rounded shadow p-4 relative">
              {modifiedUsers[user.id] && (
                <button
                  className="absolute top-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
                  onClick={() => handleSave(user)}
                  title="Grabar cambios"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
              )}
              <div className="font-bold text-blue-700 text-lg mb-2 flex items-center gap-2">
                {user.username}
                {user.is_superadmin && <span className="bg-yellow-300 text-xs text-black px-2 py-1 rounded">Superadmin</span>}
              </div>
              <div className="text-gray-700 mb-1">{user.email}</div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm text-gray-500">Activo:</label>
                <input
                  type="checkbox"
                  checked={user.is_active}
                  onChange={e => handleActiveChange(user.id, e.target.checked)}
                  disabled={user.id === loggedUserId}
                />
                {user.id === loggedUserId && (
                  <span className="text-xs text-red-500 ml-2">No puedes desactivarte</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-2">Creado: {user.created_at}</div>
              <div className="text-sm text-gray-500">Tenants:</div>
              <ul className="list-disc ml-5">
                {user.tenants.map((tenant) => (
                  <li key={tenant.id}>{tenant.name}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
