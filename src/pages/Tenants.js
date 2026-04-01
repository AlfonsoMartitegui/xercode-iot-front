import React, { useEffect, useState } from "react";
import { createTenant } from "../api/createTenant";
import { getTenants } from "../api/tenants";

export default function Tenants({ token }) {
  const [modifiedDomains, setModifiedDomains] = useState({});
  const [editDomainModal, setEditDomainModal] = useState({ open: false, tenantId: null, domainObj: null, value: "" });
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState({ name: "", code: "", is_active: true });
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTenants(token)
      .then(setTenants)
      .catch(err => setError(err));
  }, [token]);

  // Handler para crear tenant
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!form.name || !form.code) {
      setModalError("Todos los campos son obligatorios.");
      return;
    }
    setModalLoading(true);
    try {
      await createTenant(token, form);
      setShowModal(false);
      setForm({ name: "", code: "", is_active: true });
      // Refrescar lista
      const data = await getTenants(token);
      setTenants(data);
    } catch (err) {
      setModalError(err);
    }
    setModalLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-6 bg-white rounded shadow p-4 flex items-center justify-between">
        <span className="text-lg font-bold">Tenants</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>Añadir tenant</button>
      </div>
      {error && <div className="text-red-500 mb-4">{String(error)}</div>}

      {/* Modal para añadir tenant */}
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
            <h2 className="text-xl font-bold mb-4">Añadir tenant</h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label className="text-sm">Activo</label>
              </div>
              {modalError && <div className="text-red-500 text-sm">{modalError}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" disabled={modalLoading}>
                {modalLoading ? "Creando..." : "Crear tenant"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-white rounded shadow p-4 relative">
            {/* Botón de validar si hay dominios modificados en este tenant */}
            {tenant.domains && tenant.domains.some(d => modifiedDomains[d.id]) && (
              <button
                className="absolute top-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
                title="Validar cambios de dominio"
                onClick={() => {
                  // Aquí irá la llamada a backend en el futuro
                  // Al validar, quitamos el estado modificado
                  setModifiedDomains(prev => {
                    const nuevo = { ...prev };
                    tenant.domains.forEach(d => { if (nuevo[d.id]) delete nuevo[d.id]; });
                    return nuevo;
                  });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            )}
            <div className="font-bold text-blue-700 text-lg mb-2 flex items-center gap-2">
              {tenant.name}
              {!tenant.is_active && <span className="bg-red-200 text-xs text-red-700 px-2 py-1 rounded">Inactivo</span>}
            </div>
            <div className="text-gray-700 mb-1">Código: {tenant.code}</div>
            <div className="text-sm text-gray-500 mb-2">ID: {tenant.id}</div>
            <div className="text-sm text-gray-500">Dominios:</div>
            <ul className="list-disc ml-5">
              {tenant.domains && tenant.domains.length > 0 ? (
                tenant.domains.map((domainObj, idx) => (
                  <li key={domainObj.id || idx} className="flex items-center gap-2">
                    <span>{domainObj.domain || String(domainObj)}</span>
                    <button
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      onClick={() => setEditDomainModal({ open: true, tenantId: tenant.id, domainObj, value: domainObj.domain })}
                    >Actualizar dominio</button>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Sin dominios</li>
              )}
      {/* Modal para editar dominio */}
      {editDomainModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setEditDomainModal({ open: false, tenantId: null, domainObj: null, value: "" })}
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-bold mb-4">Actualizar dominio</h2>
            <form onSubmit={e => { e.preventDefault(); /* Aquí irá la lógica de actualización */ }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dominio</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editDomainModal.value}
                  onChange={e => setEditDomainModal(modal => ({ ...modal, value: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                onClick={() => {
                  // Actualizar el valor en la card y marcar como modificado
                  setTenants(prev => prev.map(t => {
                    if (t.id !== editDomainModal.tenantId) return t;
                    return {
                      ...t,
                      domains: t.domains.map(d =>
                        d.id === editDomainModal.domainObj.id ? { ...d, domain: editDomainModal.value } : d
                      )
                    };
                  }));
                  setModifiedDomains(prev => ({ ...prev, [editDomainModal.domainObj.id]: true }));
                  setEditDomainModal({ open: false, tenantId: null, domainObj: null, value: "" });
                }}
              >
                Guardar cambios
              </button>
            {/* Botón de validar si hay dominios modificados en este tenant */}
            {tenant.domains.some(d => modifiedDomains[d.id]) && (
              <button
                className="absolute top-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
                title="Validar cambios de dominio"
                onClick={() => {
                  // Aquí irá la llamada a backend en el futuro
                  // Al validar, quitamos el estado modificado
                  setModifiedDomains(prev => {
                    const nuevo = { ...prev };
                    tenant.domains.forEach(d => { if (nuevo[d.id]) delete nuevo[d.id]; });
                    return nuevo;
                  });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            )}
            </form>
          </div>
        </div>
      )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
