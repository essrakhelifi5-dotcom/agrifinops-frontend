"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TrendingUp, Users, Database } from "lucide-react";

export default function StatsPage() {
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
      console.log("Erreur stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Données pour le graphique par rôle
  const roleData = [
    { role: "CEO", count: stats?.ceoCount || 0, color: "#22c55e" },
    { role: "Manager", count: stats?.managerCount || 0, color: "#3b82f6" },
    { role: "Admin", count: stats?.adminCount || 0, color: "#8b5cf6" },
  ];

  // Données pour le graphique par company
  const companyData = [
    { company: "S1", count: stats?.s1Count || 0, color: "#f59e0b" },
    { company: "S2", count: stats?.s2Count || 0, color: "#ec4899" },
  ];

  const maxRole = Math.max(...roleData.map(d => d.count), 1);
  const maxCompany = Math.max(...companyData.map(d => d.count), 1);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Statistiques Détaillées</h1>
        <p className="text-gray-500 text-sm mt-1">BF6 : Vue d'ensemble du système</p>
      </div>

      {/*  Graphique Utilisateurs par Rôle */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Utilisateurs par Rôle</h2>
        <div className="space-y-4">
          {roleData.map((item) => (
            <div key={item.role} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 w-16">{item.role}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                <div
                  className="h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                  style={{
                    width: `${(item.count / maxRole) * 100}%`,
                    backgroundColor: item.color,
                    minWidth: item.count > 0 ? "2rem" : "0",
                  }}
                >
                  <span className="text-white text-sm font-bold">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*  Graphique Utilisateurs par Company */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Utilisateurs par Company</h2>
        <div className="space-y-4">
          {companyData.map((item) => (
            <div key={item.company} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 w-16">{item.company}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative">
                <div
                  className="h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                  style={{
                    width: `${(item.count / maxCompany) * 100}%`,
                    backgroundColor: item.color,
                    minWidth: item.count > 0 ? "2rem" : "0",
                  }}
                >
                  <span className="text-white text-sm font-bold">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Database size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Données</p>
              <p className="text-2xl font-bold text-gray-800">
                {(stats?.totalInvoices || 0) + (stats?.totalExpenses || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}