import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const AuthContext = createContext(null);

// ACL role constants
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
};

// Returns the PRIMARY role of the user (highest privilege first)
function getPrimaryRole(user) {
  if (!user) return null;
  const roles = user.roles?.map((r) => r.toUpperCase()) || [];
  if (roles.includes('SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (roles.includes('MANAGER')) return 'MANAGER';
  if (roles.includes('OPERATOR')) return 'OPERATOR';
  // fallback
  return roles[0] || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) { setUser(JSON.parse(saved)); }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const role = getPrimaryRole(user);
    if (role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(permission);
  };

  // ACL helper — checks if current user can perform an action
  // Actions: 'edit', 'delete', 'print', 'view', 'create', 'admin'
  // Resources: 'invoice', 'quotation', 'customer', 'vendor', 'expense', 'report', 'user', 'settings', 'ledger', 'forms'
  const can = (action) => {
    if (!user) return false;
    const role = getPrimaryRole(user);

    if (role === 'SUPER_ADMIN') return true;

    if (role === 'MANAGER') {
      // Manager can do everything EXCEPT edit
      if (action === 'edit') return false;
      return true;
    }

    if (role === 'OPERATOR') {
      // Operator can only create/view invoices and quotations
      if (action === 'create' || action === 'view') return true;
      return false;
    }

    return false;
  };

  // Check if user can access a specific page/section
  const canAccess = (section) => {
    if (!user) return false;
    const role = getPrimaryRole(user);

    if (role === 'SUPER_ADMIN') return true;
    if (role === 'MANAGER') return true; // Manager sees all pages
    if (role === 'OPERATOR') {
      // Operator only sees invoice and quotation
      return ['invoice', 'quotation', 'cars', 'websites'].includes(section);
    }
    return false;
  };

  const userRole = getPrimaryRole(user);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, can, canAccess, userRole, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { api };
