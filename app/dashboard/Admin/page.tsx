"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, TrendingUp, Database, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (error) {
      console.log("Erreur chargement stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;

  const roleItems = [
    { label: "CEO",     count: stats?.ceoCount     || 0, color: "#22c55e" },
    { label: "Manager", count: stats?.managerCount  || 0, color: "#3b82f6" },
    { label: "Admin",   count: stats?.adminCount    || 0, color: "#8b5cf6" },
  ];

  const companyItems = [
    { label: "S1", count: stats?.s1Count || 0, color: "#f59e0b" },
    { label: "S2", count: stats?.s2Count || 0, color: "#ec4899" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
        <p className="text-gray-500 text-sm mt-1">Gestion du système Agri-FinOps</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Utilisateurs</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-400">Actifs</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.activeUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Comptes actifs</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <span className="text-xs text-gray-400">Inactifs</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.inactiveUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Comptes désactivés</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <span className="text-xs text-gray-400">QB Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.activeQBConnections}</p>
          <p className="text-xs text-gray-400 mt-1">Connexions QuickBooks</p>
        </div>

      </div>

      {/* ── Dashboard BI : Users par Rôle & Company ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Dashboard BI — Utilisateurs par Rôle & Company
        </h2>
        <p className="text-xs text-gray-400 mb-6">Répartition des accès système</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Par Rôle */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Par Rôle
            </p>
            <div className="space-y-4">
              {roleItems.map((item) => {
                const pct = totalUsers > 0
                  ? Math.round((item.count / totalUsers) * 100)
                  : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span>{item.count} users · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-8">
                      <div
                        className="h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, item.count > 0 ? 10 : 0)}%`,
                          backgroundColor: item.color,
                        }}
                      >
                        <span className="text-white text-xs font-bold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende rôles */}
            <div className="flex gap-4 mt-6">
              {roleItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Par Company */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Par Company
            </p>
            <div className="space-y-4">
              {companyItems.map((item) => {
                const pct = totalUsers > 0
                  ? Math.round((item.count / totalUsers) * 100)
                  : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <span>{item.count} users · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-8">
                      <div
                        className="h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                        style={{
                          width: `${Math.max(pct, item.count > 0 ? 10 : 0)}%`,
                          backgroundColor: item.color,
                        }}
                      >
                        <span className="text-white text-xs font-bold">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende companies */}
            <div className="flex gap-4 mt-6">
              {companyItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Actifs</p>
                <p className="text-xl font-bold text-green-600">{stats?.activeUsers || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Inactifs</p>
                <p className="text-xl font-bold text-red-500">{stats?.inactiveUsers || 0}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Données Système */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Données QuickBooks</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Factures</span>
              <span className="font-bold text-gray-800">{stats?.totalInvoices}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Dépenses</span>
              <span className="font-bold text-gray-800">{stats?.totalExpenses}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Statut Système</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Système opérationnel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">API QuickBooks active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Base de données OK</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}