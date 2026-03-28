"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { AlertCircle, CheckCircle, Clock, DollarSign, RefreshCw } from "lucide-react";

export default function ManagerDashboard() {

  const [arAging, setArAging] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categoryMargins, setCategoryMargins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [arData, categoryData] = await Promise.all([
        api.getArAging(),
        api.getCategoryMargins(),
      ]);

      setArAging(arData.data || []);
      setCategoryMargins(categoryData.data || []);
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

  const totalAR = arAging.reduce((sum, item) => sum + item.total, 0);
  const overdueAR = arAging
    .filter(item => item.label !== '0-30 jours')
    .reduce((sum, item) => sum + item.total, 0);

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
          <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Suivi des AR et des dépenses
          </p>
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

        {/* Total AR */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total AR</p>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">${totalAR.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Factures impayées</p>
        </div>

        {/* AR en retard */}
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

        {/* Factures 0-30j */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">0-30 jours</p>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ${arAging.find(a => a.label === '0-30 jours')?.total.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {arAging.find(a => a.label === '0-30 jours')?.count || 0} factures
          </p>
        </div>

        {/* Factures +90j */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">+90 jours</p>
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-orange-500">
            ${arAging.find(a => a.label === '+90 jours')?.total.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {arAging.find(a => a.label === '+90 jours')?.count || 0} factures
          </p>
        </div>

      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* AR Aging Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">AR Aging</h2>
          <p className="text-xs text-gray-400 mb-4">Factures impayées par tranche</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={arAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#f59e0b" name="Total ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Dépenses par Catégorie</h2>
          <p className="text-xs text-gray-400 mb-4">Répartition des coûts</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryMargins} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={150} />
              <Tooltip />
              <Bar dataKey="amount" fill="#22c55e" name="Montant ($)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── AR Aging Table ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Détail AR Aging
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Tranche</th>
              <th className="p-3 text-right text-gray-500 font-medium">Nb Factures</th>
              <th className="p-3 text-right text-gray-500 font-medium">Total</th>
              <th className="p-3 text-right text-gray-500 font-medium">% du Total</th>
              <th className="p-3 text-center text-gray-500 font-medium">Urgence</th>
            </tr>
          </thead>
          <tbody>
            {arAging.map((item: any) => (
              <tr key={item.label} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{item.label}</td>
                <td className="p-3 text-right text-gray-600">{item.count}</td>
                <td className="p-3 text-right font-medium text-gray-800">${item.total.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-600">
                  {totalAR > 0 ? ((item.total / totalAR) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.label === '0-30 jours' ? 'bg-green-50 text-green-600' :
                    item.label === '31-60 jours' ? 'bg-yellow-50 text-yellow-600' :
                    item.label === '61-90 jours' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {item.label === '0-30 jours' ? 'Normal' :
                     item.label === '31-60 jours' ? 'Attention' :
                     item.label === '61-90 jours' ? 'Urgent' : 'Critique'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Expense Tracking Table ── */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Expense Tracking par Catégorie
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Catégorie</th>
              <th className="p-3 text-right text-gray-500 font-medium">Montant</th>
              <th className="p-3 text-right text-gray-500 font-medium">% Total</th>
              <th className="p-3 text-center text-gray-500 font-medium">Niveau</th>
            </tr>
          </thead>
          <tbody>
            {categoryMargins.map((item: any) => (
              <tr key={item.category} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{item.category}</td>
                <td className="p-3 text-right text-gray-800 font-medium">${item.amount.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-600">{item.percentage}%</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.percentage > 30 ? 'bg-red-50 text-red-600' :
                    item.percentage > 15 ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {item.percentage > 30 ? 'Élevé' :
                     item.percentage > 15 ? 'Moyen' : 'Faible'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}