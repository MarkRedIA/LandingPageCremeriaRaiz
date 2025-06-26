"use client";

import React, { useState, useEffect, useRef } from "react";
import SalesDashboard from "../SalesDashboard";

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin123";
const STORAGE_KEY = "dashboard-authenticated";

export default function DashboardSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(localStorage.getItem(STORAGE_KEY) === "true");
    }
  }, []);

  // Si se hace scroll a #dashboard y no está autenticado, resalta el login
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#dashboard" && loginRef.current) {
        setHighlight(true);
        setTimeout(() => setHighlight(false), 1200);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === DEFAULT_USER && password === DEFAULT_PASS) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setError("");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <section id="dashboard" className="py-20 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-[60vh] flex flex-col items-center justify-center">
        <div
          ref={loginRef}
          id="dashboard-login"
          className={`bg-white rounded-xl shadow-lg p-8 w-full max-w-sm transition-all duration-500 ${highlight ? 'ring-4 ring-blue-400' : ''}`}
        >
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Acceso Administrador</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Usuario</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="py-20 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
        <SalesDashboard />
      </div>
    </section>
  );
} 