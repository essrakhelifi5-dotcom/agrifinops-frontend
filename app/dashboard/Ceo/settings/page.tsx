"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

export default function ManagerSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

 const handleExportReport = async () => {
    setExporting(true);
    try {
      const response = await fetch("http://localhost:3001/analytics/export-report", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Gestion du compte Manager</p>
      </div>

      {user && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations du compte</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nom</span>
              <span className="font-medium text-gray-700">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-gray-700">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rôle</span>
              <span className="font-medium text-gray-700">{user.role}</span>
            </div>
          </div>
        </div>
      )}

      

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Déconnexion</h2>
        <p className="text-sm text-gray-500 mb-4">
          Vous serez redirigé vers la page de connexion.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm"
        >
          Se déconnecter
        </button>
      </div>

      {/* Export Rapport */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-700 dark:text-green-400" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Export de Rapports</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Téléchargez un rapport complet au format PDF incluant toutes les données financières.
            </p>
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <Download size={16} />
              {exporting ? "Export en cours..." : "Télécharger le rapport PDF"}
            </button>
          </div>
        </div>

    </div>
  );
}