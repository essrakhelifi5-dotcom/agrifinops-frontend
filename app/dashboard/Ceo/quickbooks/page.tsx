"use client";

import { useEffect, useState } from "react";
//Objet contenant les appels vers le backend
import { api } from "@/lib/api";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function QuickBooksPage() {
  //Stocke les informations de l'entreprise QuickBooks.
  const [company, setCompany] = useState<any>(null);
  //Indique si QuickBooks est connecté
  const [connected, setConnected] = useState(false);
  //Indique si une synchronisation est en cours
  const [syncing, setSyncing] = useState(false);
  //Contient le résultat de la synchronisation
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCompanyInfo();
        setCompany(data);
        setConnected(true);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
//user click sur le bouton Sync Now, cette fonction est appelée 
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.syncAll();
      setSyncResult(result);
    } catch (error) {
      console.log("Erreur sync");
    } finally {
      setSyncing(false);
    }
  };

  const connectQuickBooks = () => {
    window.location.href = api.getQuickBooksAuthUrl();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">+
        <h1 className="text-2xl font-bold text-gray-800">QuickBooks</h1>
        <p className="text-gray-500 text-sm mt-1">Gestion de la connexion QuickBooks</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connected ? (
              <CheckCircle size={24} className="text-green-500" />
            ) : (
              <XCircle size={24} className="text-red-500" />
            )}
            <div>
              <p className="font-semibold text-gray-800">
                {connected ? "QuickBooks Connecté" : "QuickBooks Non Connecté"}
              </p>
              <p className="text-xs text-gray-400">
                {connected ? "Sandbox environment" : "Cliquez pour connecter"}
              </p>
            </div>
          </div>
          <button
            onClick={connected ? handleSync : connectQuickBooks}
            disabled={syncing}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition text-sm"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Sync..." : connected ? "Sync Now" : "Connecter"}
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="font-semibold text-green-700 mb-2">✅ Synchronisation terminée !</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Factures</p>
              <p className="font-medium">+{syncResult.invoices?.created} créées</p>
              <p className="font-medium">{syncResult.invoices?.updated} mises à jour</p>
            </div>
            <div>
              <p className="text-gray-500">Dépenses</p>
              <p className="font-medium">+{syncResult.expenses?.created} créées</p>
              <p className="font-medium">{syncResult.expenses?.updated} mises à jour</p>
            </div>
            <div>
              <p className="text-gray-500">Paiements</p>
              <p className="font-medium">+{syncResult.payments?.created} créés</p>
            </div>
          </div>
        </div>
      )}

      {/* Company Info */}
      {company && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations Entreprise</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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