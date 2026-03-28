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
  Clock, CreditCard, Percent, RefreshCw
} from "lucide-react";

export default function CeoDashboard() {

  const [kpis, setKpis] = useState<any>(null);
  const [burnVsEarn, setBurnVsEarn] = useState<any[]>([]);
  const [categoryMargins, setCategoryMargins] = useState<any[]>([]);
  const [arAging, setArAging] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);

  // ── Charge toutes les données au montage ──
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [kpisData, burnData, categoryData, arData, companyData] = await Promise.all([
        api.getKpis(),
        api.getBurnVsEarn(),
        api.getCategoryMargins(),
        api.getArAging(),
        api.getCompanyInfo(),
      ]);

      setKpis(kpisData);
      setBurnVsEarn(burnData.data || []);
      setCategoryMargins(categoryData.data || []);
      setArAging(arData.data || []);
      setCompany(companyData);
      setConnected(true);
    } catch (error) {
      console.log("Erreur chargement données");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Sync manuelle ──
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

  // ── Connexion QuickBooks ──
  const connectQuickBooks = () => {
    window.location.href = api.getQuickBooksAuthUrl();
  };

  // ── Format montant ──
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
          {/* Statut sync */}
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Sync active
          </div>
          {/* Bouton sync */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sync..." : "Sync Now"}
          </button>
          {/* Bouton QuickBooks */}
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

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
            <p className="text-xs text-green-500 mt-2">↑ Healthy Position</p>
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
            <p className="text-xs text-red-400 mt-2">↓ 3.2% vs mois dernier</p>
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
            <p className="text-xs text-green-500 mt-2">↑ 1.2 mois vs dernier</p>
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
            <p className="text-xs text-gray-400 mt-1">Ce mois-ci</p>
            <p className="text-xs text-green-500 mt-2">↑ 9.4% vs mois dernier</p>
          </div>

          {/* Dépenses Mensuelles */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dépenses Mensuelles</p>
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown size={18} className="text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{formatAmount(kpis.burnRate)}</p>
            <p className="text-xs text-gray-400 mt-1">Ce mois-ci</p>
            <p className="text-xs text-red-400 mt-2">↓ 3.6% vs mois dernier</p>
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

        {/* Burn vs Earn Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Cash Flow Overview</h2>
          <p className="text-xs text-gray-400 mb-4">Revenue vs Expenses (Monthly)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={burnVsEarn}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenus" dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={2} name="Dépenses" dot={false} />
            </LineChart>
          </ResponsiveContainer>
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

      {/* ── AR Aging + Recent Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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

        {/* Company Info */}
        {company && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations Entreprise</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nom</span>
                <span className="font-medium text-gray-700">{company.CompanyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pays</span>
                <span className="font-medium text-gray-700">{company.Country}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="font-medium text-gray-700">{company.Email?.Address}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Téléphone</span>
                <span className="font-medium text-gray-700">{company.PrimaryPhone?.FreeFormNumber}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}