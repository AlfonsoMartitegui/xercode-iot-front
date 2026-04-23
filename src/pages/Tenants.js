import React, { useEffect, useState } from "react";
import {
  createTenant,
  createTenantDomain,
  deleteTenant,
  deleteTenantDomain,
  getTenant,
  getTenantDomain,
  getTenants,
  updateTenantDomain,
  updateTenant,
} from "../api/tenants";

const emptyForm = {
  name: "",
  code: "",
  address: "",
  redirect_url: "",
  beaver_base_url: "",
  beaver_admin_username: "",
  beaver_admin_password: "",
  is_active: true,
};

const emptyDomainForm = {
  domain: "",
  is_primary: false,
};

function TenantFormModal({
  title,
  submitLabel,
  form,
  onChange,
  onClose,
  onSubmit,
  loading,
  error,
  isEdit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Codigo</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.code}
              onChange={(e) => onChange("code", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Direccion</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Redirect URL</label>
            <input
              type="url"
              className="w-full border rounded px-3 py-2"
              value={form.redirect_url}
              onChange={(e) => onChange("redirect_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Beaver Base URL</label>
            <input
              type="url"
              className="w-full border rounded px-3 py-2"
              value={form.beaver_base_url}
              onChange={(e) => onChange("beaver_base_url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-1">Configuracion Beaver</h3>
            <p className="text-xs text-gray-500 mb-4">
              Datos tecnicos guardados en HUB para preparar la integracion. No ejecuta sincronizacion con Beaver.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usuario admin Beaver</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-white"
                  value={form.beaver_admin_username}
                  onChange={(e) => onChange("beaver_admin_username", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password admin Beaver</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 bg-white"
                  value={form.beaver_admin_password}
                  onChange={(e) => onChange("beaver_admin_password", e.target.value)}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEdit
                    ? "Dejar vacio para conservar la password actual."
                    : "Se guarda cifrada en backend y no se vuelve a mostrar."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => onChange("is_active", e.target.checked)}
            />
            <label className="text-sm">Activo</label>
          </div>
          {error && <div className="text-red-500 text-sm">{String(error)}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Guardando..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

function DomainFormModal({
  title,
  submitLabel,
  form,
  onChange,
  onClose,
  onSubmit,
  loading,
  error,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          title="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dominio</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.domain}
              onChange={(e) => onChange("domain", e.target.value)}
              placeholder="cliente.midominio.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              El backend normaliza el dominio sin protocolo ni path.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_primary}
              onChange={(e) => onChange("is_primary", e.target.checked)}
            />
            <label className="text-sm">Dominio principal</label>
          </div>
          {error && <div className="text-red-500 text-sm">{String(error)}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Guardando..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Tenants({ token }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, tenantId: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [domainForm, setDomainForm] = useState(emptyDomainForm);
  const [domainModal, setDomainModal] = useState({
    open: false,
    tenantId: null,
    domainId: null,
  });
  const [domainModalLoading, setDomainModalLoading] = useState(false);
  const [domainModalError, setDomainModalError] = useState("");
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");
  const [deletingTenantId, setDeletingTenantId] = useState(null);
  const [deletingDomainKey, setDeletingDomainKey] = useState("");

  async function loadTenants() {
    try {
      setError("");
      const data = await getTenants(token);
      setTenants(data);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    loadTenants();
  }, [token]);

  function handleFormChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetModalState() {
    setForm(emptyForm);
    setModalError("");
    setModalLoading(false);
    setShowCreateModal(false);
    setEditModal({ open: false, tenantId: null });
  }

  function handleDomainFormChange(field, value) {
    setDomainForm((current) => ({ ...current, [field]: value }));
  }

  function resetDomainModalState() {
    setDomainForm(emptyDomainForm);
    setDomainModalError("");
    setDomainModalLoading(false);
    setDomainModal({ open: false, tenantId: null, domainId: null });
  }

  function buildTenantPayload() {
    const payload = { ...form };

    if (!payload.beaver_admin_password) {
      delete payload.beaver_admin_password;
    }

    return payload;
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setModalError("");

    if (!form.name || !form.code) {
      setModalError("Nombre y codigo son obligatorios.");
      return;
    }

    setModalLoading(true);
    try {
      const payload = buildTenantPayload();
      if (editModal.open && editModal.tenantId) {
        await updateTenant(token, editModal.tenantId, payload);
      } else {
        await createTenant(token, payload);
      }
      resetModalState();
      await loadTenants();
    } catch (err) {
      setModalError(err);
      setModalLoading(false);
      return;
    }
    setModalLoading(false);
  }

  async function handleEditClick(tenantId) {
    setModalError("");
    setModalLoading(true);
    setEditModal({ open: true, tenantId });

    try {
      const tenant = await getTenant(token, tenantId);
      setForm({
        name: tenant.name || "",
        code: tenant.code || "",
        address: tenant.address || "",
        redirect_url: tenant.redirect_url || "",
        beaver_base_url: tenant.beaver_base_url || "",
        beaver_admin_username: tenant.beaver_admin_username || "",
        beaver_admin_password: "",
        is_active: tenant.is_active ?? true,
      });
    } catch (err) {
      setError(err);
      setEditModal({ open: false, tenantId: null });
    }

    setModalLoading(false);
  }

  async function handleDeleteClick(tenantId) {
    setDeletingTenantId(tenantId);
    setError("");

    try {
      await deleteTenant(token, tenantId);
      await loadTenants();
    } catch (err) {
      setError(err);
    }

    setDeletingTenantId(null);
  }

  async function handleAddDomainClick(tenantId) {
    setDomainForm(emptyDomainForm);
    setDomainModalError("");
    setDomainModal({ open: true, tenantId, domainId: null });
  }

  async function handleEditDomainClick(tenantId, domainId) {
    setDomainModalError("");
    setDomainModalLoading(true);
    setDomainModal({ open: true, tenantId, domainId });

    try {
      const domain = await getTenantDomain(token, tenantId, domainId);
      setDomainForm({
        domain: domain.domain || "",
        is_primary: domain.is_primary ?? false,
      });
    } catch (err) {
      setError(err);
      setDomainModal({ open: false, tenantId: null, domainId: null });
    }

    setDomainModalLoading(false);
  }

  async function handleDomainSubmit(e) {
    e.preventDefault();
    setDomainModalError("");

    if (!domainForm.domain) {
      setDomainModalError("El dominio es obligatorio.");
      return;
    }

    setDomainModalLoading(true);
    try {
      if (domainModal.domainId) {
        await updateTenantDomain(token, domainModal.tenantId, domainModal.domainId, domainForm);
      } else {
        await createTenantDomain(token, domainModal.tenantId, domainForm);
      }
      resetDomainModalState();
      await loadTenants();
    } catch (err) {
      setDomainModalError(err);
      setDomainModalLoading(false);
      return;
    }
    setDomainModalLoading(false);
  }

  async function handleDeleteDomainClick(tenantId, domainId) {
    const key = `${tenantId}-${domainId}`;
    setDeletingDomainKey(key);
    setError("");

    try {
      await deleteTenantDomain(token, tenantId, domainId);
      await loadTenants();
    } catch (err) {
      setError(err);
    }

    setDeletingDomainKey("");
  }

  return (
    <div className="p-8">
      <div className="mb-6 bg-white rounded shadow p-4 flex items-center justify-between">
        <span className="text-lg font-bold">Tenants</span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {
            setForm(emptyForm);
            setModalError("");
            setShowCreateModal(true);
          }}
        >
          Anadir tenant
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{String(error)}</div>}

      {showCreateModal && (
        <TenantFormModal
          title="Anadir tenant"
          submitLabel="Crear tenant"
          form={form}
          onChange={handleFormChange}
          onClose={resetModalState}
          onSubmit={handleModalSubmit}
          loading={modalLoading}
          error={modalError}
          isEdit={false}
        />
      )}

      {editModal.open && (
        <TenantFormModal
          title="Editar tenant"
          submitLabel="Guardar cambios"
          form={form}
          onChange={handleFormChange}
          onClose={resetModalState}
          onSubmit={handleModalSubmit}
          loading={modalLoading}
          error={modalError}
          isEdit
        />
      )}

      {domainModal.open && (
        <DomainFormModal
          title={domainModal.domainId ? "Editar dominio" : "Anadir dominio"}
          submitLabel={domainModal.domainId ? "Guardar dominio" : "Crear dominio"}
          form={domainForm}
          onChange={handleDomainFormChange}
          onClose={resetDomainModalState}
          onSubmit={handleDomainSubmit}
          loading={domainModalLoading}
          error={domainModalError}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-white rounded shadow p-4 relative">
            <div className="font-bold text-blue-700 text-lg mb-2 flex items-center gap-2 pr-24">
              {tenant.name}
              <span className={`text-xs px-2 py-1 rounded ${tenant.is_active ? "bg-green-100 text-green-700" : "bg-red-200 text-red-700"}`}>
                {tenant.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                onClick={() => handleEditClick(tenant.id)}
              >
                Editar
              </button>
              <button
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-60"
                onClick={() => handleDeleteClick(tenant.id)}
                disabled={deletingTenantId === tenant.id}
              >
                {deletingTenantId === tenant.id ? "Borrando..." : "Baja"}
              </button>
            </div>

            <div className="text-gray-700 mb-1">Codigo: {tenant.code}</div>
            <div className="text-sm text-gray-500 mb-2">ID: {tenant.id}</div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Direccion:</span> {tenant.address || "No definida"}
            </div>
            <div className="text-sm text-gray-700 mb-1 break-all">
              <span className="font-medium">Redirect URL:</span> {tenant.redirect_url || "No definida"}
            </div>
            <div className="text-sm text-gray-700 mb-3 break-all">
              <span className="font-medium">Beaver Base URL:</span> {tenant.beaver_base_url || "No definida"}
            </div>
            <div className="text-sm text-gray-700 mb-3 break-all">
              <span className="font-medium">Usuario admin Beaver:</span> {tenant.beaver_admin_username || "No definido"}
            </div>

            <div className="text-sm text-gray-500">Dominios:</div>
            <div className="mt-2 mb-3">
              <button
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => handleAddDomainClick(tenant.id)}
              >
                Anadir dominio
              </button>
            </div>
            <ul className="list-disc ml-5">
              {tenant.domains && tenant.domains.length > 0 ? (
                tenant.domains.map((domainObj, idx) => (
                  <li key={domainObj.id || idx} className="mb-2">
                    <div className="break-all flex items-start justify-between gap-3">
                      <div>
                        <span>{domainObj.domain || String(domainObj)}</span>
                        {domainObj.is_primary && (
                          <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Primario
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          onClick={() => handleEditDomainClick(tenant.id, domainObj.id)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-60"
                          onClick={() => handleDeleteDomainClick(tenant.id, domainObj.id)}
                          disabled={deletingDomainKey === `${tenant.id}-${domainObj.id}`}
                        >
                          {deletingDomainKey === `${tenant.id}-${domainObj.id}` ? "Borrando..." : "Borrar"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Sin dominios</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
