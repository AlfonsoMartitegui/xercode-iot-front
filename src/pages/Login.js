
import React, { useState } from "react";
import { login } from "../api/auth";
import { getMe } from "../api/user";
import Dashboard from "./Dashboard";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tenantCode, setTenantCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login({ username, password });
      localStorage.setItem("token", data.access_token);
      // Obtener datos de usuario
      const userData = await getMe(data.access_token);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.is_superadmin) {
        // Redirigir a dashboard
        // Se muestra el dashboard en vez del login
      } else {
        setTenantCode(userData.tenant_code);
        setShowModal(true);
      }
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        if (err.msg) setError(err.msg);
        else if (err.detail) setError(err.detail);
        else setError(JSON.stringify(err));
      } else {
        setError(err);
      }
    }
  };

  if (user && user.is_superadmin) {
    return <Dashboard user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover" style={{ backgroundImage: 'url("")' }}>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Usuario</label>
            <input
              type="text"
              className="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{String(error)}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>
        {/* Modal para no superadmin */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto text-center">
              <h3 className="text-lg font-bold mb-4">REDIRECTING TO:</h3>
              <div className="text-blue-600 font-mono text-xl">{tenantCode}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
