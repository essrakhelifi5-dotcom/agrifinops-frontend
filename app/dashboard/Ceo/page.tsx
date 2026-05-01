"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign,
  Clock, CreditCard, RefreshCw, Brain,
} from "lucide-react";

export default function CeoDashboard() {

  const [kpis, setKpis] = useState<any>(null);
  const [financialRatios, setFinancialRatios] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
 const [burnVsEarn, setBurnVsEarn] = useState<any>({ data: [], totalRevenue: 0, totalExpenses: 0, totalProfit: 0 });
  const [categoryMargins, setCategoryMargins] = useState<any[]>([]);
  const [arAging, setArAging] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [kpisData, categoryData, arData] = await Promise.all([
        api.getKpis(),
        api.getCategoryMargins(),
        api.getArAging(),
      ]);
      const burnData = await api.getBurnVsEarn();

      setKpis(kpisData);
      setBurnVsEarn(burnData);
      setCategoryMargins(categoryData.data || []);
      setArAging(arData.data || []);

      // ── Charge données Python ──
      try {
        const [ratiosData, predictData] = await Promise.all([
          api.getFinancialRatios(),
          api.getPredictCashFlow(),
        ]);
        setFinancialRatios(ratiosData);
        setPredictions(predictData.predictions || []);
      } catch {
        console.log("Python API non disponible");
      }

      // ── Charge company info QB ──
      try {
        const companyData = await api.getCompanyInfo();
        setCompany(companyData);
        setConnected(true);
      } catch {
        setConnected(false);
      }

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
    } catch (error) {
      console.log("Erreur sync");
    } finally {
      setSyncing(false);
    }
  };

  const connectQuickBooks = () => {
    window.location.href = api.getQuickBooksAuthUrl();
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k $`;
    return `${amount.toFixed(2)} $`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm mt-1">
            B264 — Agri-FinOps: QuickBooks Automated Ledger & Cash Flow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Sync active
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sync..." : "Sync Now"}
          </button>
          {!connected && (
            <button
              onClick={connectQuickBooks}
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm"
            >
              Connect QuickBooks
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

          {/* Quick Ratio */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Ratio</p>
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{kpis.quickRatio}</p>
            <p className="text-xs text-gray-400 mt-1">Liquidité immédiate</p>
            <p className="text-xs text-green-500 mt-2">✅ Position saine</p>
          </div>

          {/* Burn Rate */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Burn Rate</p>
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <DollarSign size={18} className="text-orange-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(kpis.burnRate)}</p>
            <p className="text-xs text-gray-400 mt-1">Dépenses mensuelles</p>
            {financialRatios && (
              <p className={`text-xs mt-2 ${financialRatios.burnTrendPct > 0 ? 'text-red-400' : 'text-green-500'}`}>
                {financialRatios.burnTrendPct > 0 ? '↑' : '↓'} {Math.abs(financialRatios.burnTrendPct)}% vs moyenne
              </p>
            )}
          </div>

          {/* Runway */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Runway</p>
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{kpis.runway} mois</p>
            <p className="text-xs text-gray-400 mt-1">Trésorerie restante</p>
          </div>

          {/* Revenus Mensuels */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenus Mensuels</p>
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(kpis.monthlyRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">Moyenne mensuelle</p>
            {financialRatios && (
              <p className={`text-xs mt-2 ${financialRatios.revenueTrendPct > 0 ? 'text-green-500' : 'text-red-400'}`}>
                {financialRatios.revenueTrendPct > 0 ? '↑' : '↓'} {Math.abs(financialRatios.revenueTrendPct)}% vs moyenne
              </p>
            )}
          </div>

          {/* Marge Brute */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Marge Brute</p>
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingDown size={18} className="text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {financialRatios ? `${financialRatios.grossMargin}%` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Revenus - Coûts directs</p>
            <p className="text-xs text-green-500 mt-2">
              {financialRatios?.financialStatus || ''}
            </p>
          </div>

          {/* Comptes Clients AR */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Comptes Clients (AR)</p>
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <CreditCard size={18} className="text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(kpis.totalAR)}</p>
            <p className="text-xs text-gray-400 mt-1">{kpis.unpaidInvoicesCount} factures en attente</p>
          </div>

        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

       {/* ── BD1 Cash Flow — Décisionnel ── */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <div className="flex items-center justify-between mb-1">
    <h2 className="text-sm font-semibold text-gray-700"> Cash Flow Overview</h2>
    <span className="text-xs text-gray-400"></span>
  </div>
  <p className="text-xs text-gray-400 mb-4">Revenus vs Dépenses </p>

  {/* ── Mini KPIs totaux ── */}
  <div className="grid grid-cols-3 gap-2 mb-4">
    <div className="bg-green-50 rounded-lg p-2 text-center">
      <p className="text-xs text-gray-400">Total Revenus</p>
      <p className="text-sm font-bold text-green-600">${burnVsEarn.totalRevenue?.toFixed(0)}</p>
    </div>
    <div className="bg-red-50 rounded-lg p-2 text-center">
      <p className="text-xs text-gray-400">Total Dépenses</p>
      <p className="text-sm font-bold text-red-500">${burnVsEarn.totalExpenses?.toFixed(0)}</p>
    </div>
    <div className={`rounded-lg p-2 text-center ${burnVsEarn.totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
      <p className="text-xs text-gray-400">Total Profit</p>
      <p className={`text-sm font-bold ${burnVsEarn.totalProfit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
        ${burnVsEarn.totalProfit?.toFixed(0)}
      </p>
    </div>
  </div>

  {/* ── Line Chart ── */}
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={burnVsEarn.data || []}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 11 }} />
      <Tooltip
        formatter={(value: any, name: any) => [
          `$${value}`,
          name === 'revenue' ? 'Revenus' :
          name === 'expenses' ? 'Dépenses' : 'Profit'
        ] }
      />
      <Legend />
      <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenus" dot={{ r: 3 }} />
      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Dépenses" dot={{ r: 3 }} />
      <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" strokeDasharray="5 5" dot={{ r: 3 }} />
    </LineChart>
  </ResponsiveContainer>

  {/* ── Tableau décisionnel — Dim_Temps × Dim_Statut ── */}
  <table className="w-full text-xs mt-4">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-2 text-left text-gray-500">Mois (Dim_Temps)</th>
        <th className="p-2 text-right text-gray-500">Revenus</th>
        <th className="p-2 text-right text-gray-500">Dépenses</th>
        <th className="p-2 text-right text-gray-500">Profit</th>
        <th className="p-2 text-right text-gray-500">% Profit</th>
        <th className="p-2 text-center text-gray-500">Statut</th>
      </tr>
    </thead>
    <tbody>
      {(burnVsEarn.data || []).map((row: any) => (
        <tr key={row.month} className="border-t border-gray-50 hover:bg-gray-50">
          <td className="p-2 font-medium text-gray-700">{row.monthLabel}</td>
          <td className="p-2 text-right text-green-600">${row.revenue.toFixed(0)}</td>
          <td className="p-2 text-right text-red-500">${row.expenses.toFixed(0)}</td>
          <td className={`p-2 text-right font-medium ${row.profit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            ${row.profit.toFixed(0)}
          </td>
          <td className={`p-2 text-right ${row.profitPct >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {row.profitPct}%
          </td>
          <td className="p-2 text-center">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              row.statut === 'POSITIF'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500'
            }`}>
              {row.statut === 'POSITIF' ? '✅ Positif' : '🔴 Déficit'}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        {/* Category Margins */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Dépenses par Catégorie</h2>
          <p className="text-xs text-gray-400 mb-4">Répartition des coûts</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryMargins} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={140} />
              <Tooltip />
              <Bar dataKey="amount" fill="#22c55e" name="Montant ($)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Prédictions Python + AR Aging ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── BD2 Prédictions Cash Flow — Décisionnel ── */}
{predictions.length > 0 && (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <Brain size={16} className="text-purple-500" />
        <h2 className="text-sm font-semibold text-gray-700">Prédictions Cash Flow</h2>
      </div>
      <span className="text-xs text-gray-400"></span>
    </div>
    <p className="text-xs text-gray-400 mb-4">
      
    </p>

    {/* ── Confiance modèle ── */}
    {financialRatios?.modelConfidence && (
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Confiance Revenus</p>
          <p className="text-sm font-bold text-purple-600">
            {financialRatios.modelConfidence.revenue}%
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-400">Confiance Dépenses</p>
          <p className="text-sm font-bold text-purple-600">
            {financialRatios.modelConfidence.expense}%
          </p>
        </div>
      </div>
    )}

    {/* ── Bar Chart prédictions ── */}
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={predictions}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: any, name: any) => [
            `$${value}`,
            name === 'predictedRevenue' ? 'Revenus prédits' :
            name === 'predictedExpense' ? 'Dépenses prédites' : 'Profit prédit'
          ]}
        />
        <Legend />
        <Bar dataKey="predictedRevenue" fill="#22c55e" name="Revenus prédits" radius={[4, 4, 0, 0]} />
        <Bar dataKey="predictedExpense" fill="#ef4444" name="Dépenses prédites" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>

    {/* ── Tableau décisionnel ── */}
    <table className="w-full text-xs mt-4">
      <thead>
        <tr className="bg-gray-50">
          <th className="p-2 text-left text-gray-500">Mois (Dim_Temps)</th>
          <th className="p-2 text-right text-gray-500">Rev. prédit</th>
          <th className="p-2 text-right text-gray-500">Dép. prédites</th>
          <th className="p-2 text-right text-gray-500">Profit prédit</th>
          <th className="p-2 text-right text-gray-500">% Profit</th>
          <th className="p-2 text-center text-gray-500">Alerte</th>
        </tr>
      </thead>
      <tbody>
        {predictions.map((pred: any, index: number) => (
          <tr key={index} className="border-t border-gray-50 hover:bg-gray-50">
            <td className="p-2 font-medium text-gray-700">{pred.month}</td>
            <td className="p-2 text-right text-green-600">${pred.predictedRevenue}</td>
            <td className="p-2 text-right text-red-500">${pred.predictedExpense}</td>
            <td className={`p-2 text-right font-medium ${
              pred.predictedProfit >= 0 ? 'text-blue-600' : 'text-red-500'
            }`}>
              ${pred.predictedProfit}
            </td>
            <td className={`p-2 text-right ${
              pred.profitPct >= 0 ? 'text-blue-500' : 'text-red-500'
            }`}>
              {pred.profitPct || 0}%
            </td>
            <td className="p-2 text-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                pred.statut === 'POSITIF'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500'
              }`}>
                {pred.alerte || (pred.predictedProfit >= 0 ? '✅ Positif' : '🔴 Déficit')}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        {/* AR Aging */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">AR Aging</h2>
          <p className="text-xs text-gray-400 mb-4">Factures impayées par tranche</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={arAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#f59e0b" name="Total ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Company Info ── */}
      {company && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations Entreprise</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Nom</p>
              <p className="font-medium text-gray-700 mt-1">{company.CompanyName}</p>
            </div>
            <div>
              <p className="text-gray-400">Pays</p>
              <p className="font-medium text-gray-700 mt-1">{company.Country}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-700 mt-1">{company.Email?.Address}</p>
            </div>
            <div>
              <p className="text-gray-400">Téléphone</p>
              <p className="font-medium text-gray-700 mt-1">{company.PrimaryPhone?.FreeFormNumber}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}