"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend
} from "recharts";
import { AlertCircle, CheckCircle, DollarSign, RefreshCw, TrendingDown } from "lucide-react";

export default function ManagerDashboard() {

  const [arAging, setArAging] = useState<any>({ data: [], totalAR: 0, unpaidCount: 0 });
  const [categoryMargins, setCategoryMargins] = useState<any>({ data: [], totalExpenses: 0 });
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      const [arData, categoryData, kpisData] = await Promise.all([
        api.getArAging(),
        api.getCategoryMargins(),
        api.getKpis(),
      ]);
      setArAging(arData);
      setCategoryMargins(categoryData);
      setKpis(kpisData);
    } catch (error) {
      console.log("Erreur chargement données");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncAll();
      await loadAllData();
    } finally {
      setSyncing(false);
    }
  };

  const overdueAR = (arAging.data || [])
    .filter((item: any) => item.label !== '0-30 jours')
    .reduce((sum: number, item: any) => sum + item.total, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Operations Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Suivi AR & Expense Tracking — Agri-FinOps B264</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sync..." : "Sync Now"}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total AR</p>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">${arAging.totalAR?.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{arAging.unpaidCount || 0} factures impayées</p>
          <p className="text-xs text-gray-400 mt-1">
            Statut dominant :
            <span className={`ml-1 font-medium ${
              arAging.statutDominant === 'CRITIQUE' ? 'text-red-600' :
              arAging.statutDominant === 'URGENT' ? 'text-orange-500' :
              arAging.statutDominant === 'ATTENTION' ? 'text-yellow-500' : 'text-green-600'
            }`}>
              {arAging.statutDominant}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AR en retard</p>
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">${overdueAR.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Plus de 30 jours</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">0-30 jours</p>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ${(arAging.data || []).find((a: any) => a.label === '0-30 jours')?.total.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {(arAging.data || []).find((a: any) => a.label === '0-30 jours')?.count || 0} factures
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Dépenses</p>
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-500">${categoryMargins.totalExpenses?.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{(categoryMargins.data || []).length} catégories</p>
        </div>

      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-700"> — AR Aging Dashboard</h2>
            <span className="text-xs text-gray-400"></span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
         Total : <span className="font-semibold text-red-500">${arAging.totalAR?.toFixed(2)}</span>
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={arAging.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `$${value} (${props.payload.percentage}%)`,
                  'Total AR'
                ]}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Total ($)">
                {(arAging.data || []).map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-gray-700"> — Expense Tracking</h2>
            <span className="text-xs text-gray-400"></span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            <span className="font-semibold text-orange-500"> Total: ${categoryMargins.totalExpenses?.toFixed(2)}</span>
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryMargins.data || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={150} />
              <Tooltip formatter={(value: any) => [`$${value}`, 'Montant']} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} name="Montant ($)">
                {(categoryMargins.data || []).map((entry: any, index: number) => (
                  <Cell
                    key={index}
                    fill={
                      entry.statut === 'ELEVE' ? '#ef4444' :
                      entry.statut === 'MOYEN' ? '#f59e0b' : '#22c55e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">AR Aging — Suivi des paiements en retard</h2>
            <p className="text-xs text-gray-400 mt-1"></p>
          </div>
          <span className="text-xs text-gray-400">
            Total : <span className="font-semibold text-red-500">${arAging.totalAR?.toFixed(2)}</span>
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Tranche</th>
              <th className="p-3 text-right text-gray-500 font-medium">Nb Factures</th>
              <th className="p-3 text-right text-gray-500 font-medium">Total ($)</th>
              <th className="p-3 text-right text-gray-500 font-medium">% Total AR</th>
              <th className="p-3 text-center text-gray-500 font-medium">Statut </th>
              <th className="p-3 text-center text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {(arAging.data || []).map((item: any) => (
              <tr key={item.label} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{item.label}</td>
                <td className="p-3 text-right text-gray-600">{item.count}</td>
                <td className="p-3 text-right font-medium text-gray-800">${item.total.toFixed(2)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.statut === 'NORMAL'    ? 'bg-green-50 text-green-600' :
                    item.statut === 'ATTENTION' ? 'bg-yellow-50 text-yellow-600' :
                    item.statut === 'URGENT'    ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {item.statut}
                  </span>
                </td>
                <td className="p-3 text-center text-xs text-gray-600">{item.alerte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700"> Expense Tracking — Catégorisation des dépenses</h2>
            <p className="text-xs text-gray-400 mt-1"></p>
          </div>
          <span className="text-xs text-gray-400">
            Total : <span className="font-semibold text-orange-500">${categoryMargins.totalExpenses?.toFixed(2)}</span>
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Catégorie </th>
              <th className="p-3 text-right text-gray-500 font-medium">Nb Transactions</th>
              <th className="p-3 text-right text-gray-500 font-medium">Montant ($)</th>
              <th className="p-3 text-right text-gray-500 font-medium">% Total</th>
              <th className="p-3 text-center text-gray-500 font-medium">Statut </th>
              <th className="p-3 text-center text-gray-500 font-medium">Alerte</th>
            </tr>
          </thead>
          <tbody>
            {(categoryMargins.data || []).map((item: any) => (
              <tr key={item.category} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{item.category}</td>
                <td className="p-3 text-right text-gray-600">{item.count}</td>
                <td className="p-3 text-right font-medium text-gray-800">${item.amount.toFixed(2)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          backgroundColor:
                            item.statut === 'ELEVE' ? '#ef4444' :
                            item.statut === 'MOYEN' ? '#f59e0b' : '#22c55e'
                        }}
                      />
                    </div>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.statut === 'ELEVE' ? 'bg-red-50 text-red-600' :
                    item.statut === 'MOYEN' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {item.statut}
                  </span>
                </td>
                <td className="p-3 text-center text-xs text-gray-600">{item.alerte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}