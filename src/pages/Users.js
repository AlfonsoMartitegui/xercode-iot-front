import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getUsers } from "../api/user";
import { editUser } from "../api/editUser";
import { getTenants } from "../api/tenants";
import { createUser } from "../api/createUser";
import {
  createUserTenant,
  deleteUserTenant,
  getUserTenants,
  updateUserTenant,
} from "../api/userTenants";

const emptyMembershipForm = {
  tenant_id: "",
  role: "user",
  beaver_role_id: "",
  is_active: true,
};

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
  const [membershipsByUser, setMembershipsByUser] = useState({});
  const [membershipForms, setMembershipForms] = useState({});
  const [membershipErrors, setMembershipErrors] = useState({});
  const [membershipLoading, setMembershipLoading] = useState({});
  const [membershipSavingKey, setMembershipSavingKey] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantIds: [],
    is_active: true,
  });

  async function loadMembershipsForUsers(userList) {
    const entries = await Promise.all(
      userList.map(async (user) => {
        try {
          const memberships = await getUserTenants(token, user.id);
          return [user.id, memberships];
        } catch (err) {
          setMembershipErrors((current) => ({ ...current, [user.id]: err }));
          return [user.id, []];
        }
      })
    );

    setMembershipsByUser(Object.fromEntries(entries));
  }

  async function loadUsers() {
    const data = await getUsers(token);
    setUsers(data);
    await loadMembershipsForUsers(data);
    return data;
  }

  async function loadUserMemberships(userId) {
    setMembershipLoading((current) => ({ ...current, [userId]: true }));
    setMembershipErrors((current) => ({ ...current, [userId]: "" }));

    try {
      const memberships = await getUserTenants(token, userId);
      setMembershipsByUser((current) => ({ ...current, [userId]: memberships }));
    } catch (err) {
      setMembershipErrors((current) => ({ ...current, [userId]: err }));
    }

    setMembershipLoading((current) => ({ ...current, [userId]: false }));
  }

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [userData, tenantData] = await Promise.all([
          getUsers(token),
          getTenants(token),
        ]);
        setUsers(userData);
        setTenants(tenantData);
        const membershipEntries = await Promise.all(
          userData.map(async (user) => {
            try {
              const memberships = await getUserTenants(token, user.id);
              return [user.id, memberships];
            } catch (err) {
              setMembershipErrors((current) => ({ ...current, [user.id]: err }));
              return [user.id, []];
            }
          })
        );
        setMembershipsByUser(Object.fromEntries(membershipEntries));
      } catch (err) {
        setError(err);
      }
    }

    fetchInitialData();
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
    const email = user.email?.trim();

    if (!email) {
      setError("El email es obligatorio.");
      return;
    }

    try {
      await editUser(token, user.id, {
        email,
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
    const username = form.username.trim();
    const email = form.email.trim();

    if (!username || !email || !form.password || !form.confirmPassword || form.tenantIds.length === 0) {
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
        username,
        email,
        password: form.password,
        tenant_ids: form.tenantIds,
        is_active: form.is_active,
      });
      setShowModal(false);
      // Refresh users
      await loadUsers();
    } catch (err) {
      setModalError(err);
    }
    setModalLoading(false);
  };

  function getMembershipForm(userId) {
    return membershipForms[userId] || emptyMembershipForm;
  }

  function handleMembershipFormChange(userId, field, value) {
    setMembershipForms((current) => ({
      ...current,
      [userId]: {
        ...getMembershipForm(userId),
        [field]: value,
      },
    }));
  }

  function getTenantName(user, tenantId) {
    const tenant =
      tenants.find((item) => String(item.id) === String(tenantId)) ||
      user.tenants.find((item) => String(item.id) === String(tenantId));

    return tenant?.name || `Tenant ${tenantId}`;
  }

  function getMembershipPayload(membership) {
    const beaverRoleId = membership.beaver_role_id?.trim();

    return {
      role: membership.role.trim(),
      beaver_role_id: beaverRoleId || null,
      is_active: membership.is_active,
    };
  }

  async function handleCreateMembership(userId) {
    const membershipForm = getMembershipForm(userId);

    if (!membershipForm.tenant_id || !membershipForm.role.trim()) {
      setMembershipErrors((current) => ({
        ...current,
        [userId]: "Tenant y rol son obligatorios.",
      }));
      return;
    }

    setMembershipSavingKey(`${userId}-new`);
    setMembershipErrors((current) => ({ ...current, [userId]: "" }));

    try {
      await createUserTenant(token, userId, {
        tenant_id: Number(membershipForm.tenant_id),
        ...getMembershipPayload(membershipForm),
      });
      setMembershipForms((current) => ({
        ...current,
        [userId]: emptyMembershipForm,
      }));
      await loadUserMemberships(userId);
      await loadUsers();
    } catch (err) {
      setMembershipErrors((current) => ({ ...current, [userId]: err }));
    }

    setMembershipSavingKey("");
  }

  function handleMembershipFieldChange(userId, tenantId, field, value) {
    setMembershipsByUser((current) => ({
      ...current,
      [userId]: (current[userId] || []).map((membership) =>
        String(membership.tenant_id) === String(tenantId)
          ? { ...membership, [field]: value }
          : membership
      ),
    }));
  }

  async function handleUpdateMembership(userId, membership) {
    if (!membership.role.trim()) {
      setMembershipErrors((current) => ({
        ...current,
        [userId]: "El rol HUB es obligatorio.",
      }));
      return;
    }

    const key = `${userId}-${membership.tenant_id}`;
    setMembershipSavingKey(key);
    setMembershipErrors((current) => ({ ...current, [userId]: "" }));

    try {
      await updateUserTenant(
        token,
        userId,
        membership.tenant_id,
        getMembershipPayload(membership)
      );
      await loadUserMemberships(userId);
    } catch (err) {
      setMembershipErrors((current) => ({ ...current, [userId]: err }));
    }

    setMembershipSavingKey("");
  }

  async function handleDeleteMembership(userId, tenantId) {
    const key = `${userId}-${tenantId}-delete`;
    setMembershipSavingKey(key);
    setMembershipErrors((current) => ({ ...current, [userId]: "" }));

    try {
      await deleteUserTenant(token, userId, tenantId);
      await loadUserMemberships(userId);
      await loadUsers();
    } catch (err) {
      setMembershipErrors((current) => ({ ...current, [userId]: err }));
    }

    setMembershipSavingKey("");
  }

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
          .map((user) => {
            const memberships = membershipsByUser[user.id] || [];
            const membershipForm = getMembershipForm(user.id);
            const assignedTenantIds = new Set(
              memberships.map((membership) => String(membership.tenant_id))
            );
            const availableTenants = tenants.filter(
              (tenant) => !assignedTenantIds.has(String(tenant.id))
            );

            return (
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

              <div className="border-t mt-4 pt-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Tenant memberships</div>
                    <div className="text-xs text-gray-500">
                      Roles y mapeos guardados en HUB. No ejecuta sincronizacion con Beaver.
                    </div>
                  </div>
                  <button
                    className="text-xs font-semibold bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-gray-800 transition disabled:opacity-60"
                    onClick={() => loadUserMemberships(user.id)}
                    disabled={membershipLoading[user.id]}
                  >
                    {membershipLoading[user.id] ? "Cargando..." : "Recargar"}
                  </button>
                </div>

                {membershipErrors[user.id] && (
                  <div className="text-red-500 text-sm mb-3">{String(membershipErrors[user.id])}</div>
                )}

                <div className="space-y-3 mb-4">
                  {memberships.length > 0 ? (
                    memberships.map((membership) => {
                      const saveKey = `${user.id}-${membership.tenant_id}`;
                      const deleteKey = `${user.id}-${membership.tenant_id}-delete`;

                      return (
                        <div key={`${user.id}-${membership.tenant_id}`} className="border rounded p-3 bg-gray-50">
                          <div className="font-medium text-sm text-gray-800 mb-2">
                            {getTenantName(user, membership.tenant_id)}
                          </div>
                          <div className="grid gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Rol HUB</label>
                              <select
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                                value={membership.role}
                                onChange={(e) =>
                                  handleMembershipFieldChange(
                                    user.id,
                                    membership.tenant_id,
                                    "role",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Mapeo rol Beaver</label>
                              <input
                                type="text"
                                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                                value={membership.beaver_role_id || ""}
                                onChange={(e) =>
                                  handleMembershipFieldChange(
                                    user.id,
                                    membership.tenant_id,
                                    "beaver_role_id",
                                    e.target.value
                                  )
                                }
                                placeholder="Opcional"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={membership.is_active}
                                onChange={(e) =>
                                  handleMembershipFieldChange(
                                    user.id,
                                    membership.tenant_id,
                                    "is_active",
                                    e.target.checked
                                  )
                                }
                              />
                              <label className="text-sm text-gray-700">Membresia activa</label>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition disabled:opacity-60"
                              onClick={() => handleUpdateMembership(user.id, membership)}
                              disabled={membershipSavingKey === saveKey}
                            >
                              {membershipSavingKey === saveKey ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition disabled:opacity-60"
                              onClick={() => handleDeleteMembership(user.id, membership.tenant_id)}
                              disabled={membershipSavingKey === deleteKey}
                            >
                              {membershipSavingKey === deleteKey ? "Borrando..." : "Borrar"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-400">Sin membresias explicitas</div>
                  )}
                </div>

                <div className="border rounded p-3">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Anadir membresia</div>
                  <div className="grid gap-2">
                    <select
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      value={membershipForm.tenant_id}
                      onChange={(e) =>
                        handleMembershipFormChange(user.id, "tenant_id", e.target.value)
                      }
                    >
                      <option value="">Selecciona tenant...</option>
                      {availableTenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      value={membershipForm.role}
                      onChange={(e) =>
                        handleMembershipFormChange(user.id, "role", e.target.value)
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      value={membershipForm.beaver_role_id}
                      onChange={(e) =>
                        handleMembershipFormChange(user.id, "beaver_role_id", e.target.value)
                      }
                      placeholder="Mapeo rol Beaver opcional"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={membershipForm.is_active}
                        onChange={(e) =>
                          handleMembershipFormChange(user.id, "is_active", e.target.checked)
                        }
                      />
                      Activa
                    </label>
                    <button
                      className="text-sm font-semibold bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
                      onClick={() => handleCreateMembership(user.id)}
                      disabled={membershipSavingKey === `${user.id}-new` || availableTenants.length === 0}
                    >
                      {membershipSavingKey === `${user.id}-new` ? "Anadiendo..." : "Anadir membresia"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
      </div>
    </div>
  );
}
