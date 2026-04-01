import React, { useState } from "react";
import Users from "./Users";
import Tenants from "./Tenants";

export default function Dashboard({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showTenants, setShowTenants] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: visible siempre en desktop, ocultable en móvil */}
      <div className={`bg-gray-800 text-white w-64 p-4 fixed md:static z-40 transition-transform duration-300 min-h-screen md:min-h-screen h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} md:translate-x-0`}>
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-2xl">Xercode Iot</span>
          {/* Botón cerrar solo en móvil y cuando el menú está abierto */}
          <button
            className="md:hidden text-white ml-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            style={{ display: sidebarOpen ? 'block' : 'none' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
        <div className="mb-6 text-sm text-gray-300">{user?.email}</div>
  <button className="w-full mb-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition" onClick={() => alert('Configurar Cliente (pendiente de implementar)')}>Configurar Cliente</button>
  <button className="w-full mb-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition" onClick={() => { setShowUsers(true); setShowTenants(false); }}>Usuarios</button>
  <button className="w-full mb-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition" onClick={() => { setShowUsers(false); setShowTenants(true); }}>Tenants</button>
  <button className="w-full mb-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition" onClick={() => alert('Configuración API externa (pendiente de implementar)')}>Configuración API externa</button>
      </div>
      {/* Main content */}
  <div className={`flex-1 p-8 ${!sidebarOpen ? '' : 'md:ml-64'}`}> 
        {/* Burger button solo en móvil */}
        <button
          className="md:hidden fixed top-4 left-4 z-30 bg-gray-800 text-white p-2 rounded"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {showUsers ? (
          <Users token={localStorage.getItem("token")} />
        ) : showTenants ? (
          <Tenants token={localStorage.getItem("token")} />
        ) : (
          <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Datos de Superadmin</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
