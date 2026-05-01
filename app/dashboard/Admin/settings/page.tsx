"use client";

import { useState, useEffect } from "react";
import { Settings, Download } from "lucide-react";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const response = await fetch("http://localhost:3001/analytics/export-report", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) throw new Error("Erreur export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-agrifinops-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert("✅ Rapport exporté avec succès !");
    } catch (error) {
      alert("❌ Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration du système Agri-FinOps</p>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Profil Admin */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-green-700" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Profil Administrateur
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium text-gray-800">{user?.name || "Admin"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{user?.email || "admin@agrifinops.com"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
              <span className="text-gray-500">Rôle</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium w-fit">
                {user?.role || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Export Rapport PDF */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-700" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Export de Rapports
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Téléchargez un rapport complet au format PDF incluant toutes vos données.
            </p>
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
            >
              <Download size={16} />
              {exporting ? "Export en cours..." : "Télécharger le rapport PDF"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}