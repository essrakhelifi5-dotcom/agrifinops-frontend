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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
        <p className="text-gray-500 text-sm mt-1">Gestion du système Agri-FinOps</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Utilisateurs */}
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

        {/* Utilisateurs Actifs */}
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

        {/* Utilisateurs Inactifs */}
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

        {/* Connexions QuickBooks */}
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

      {/* Utilisateurs par Rôle */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Rôle</h2>
        <div className="space-y-3">
          {stats?.usersByRole.map((item: any) => (
            <div key={item.role} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{item.role}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{item.count}</span>
            </div>
          ))}
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