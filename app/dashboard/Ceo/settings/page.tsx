"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Shield, Database, Key, Globe, Moon, Sun, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    autoBackup: true,
    maintenanceMode: false,
    sessionTimeout: 30,
    language: "fr",
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Charge le mode sombre depuis localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    alert("✅ Paramètres sauvegardés avec succès !");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Paramètres</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configuration du système Agri-FinOps</p>
      </div>

      <div className="max-w-4xl space-y-4 md:space-y-6">
        
        {/* Profil Admin */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-green-700 dark:text-green-400" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Profil CEO</h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Nom</span>
              <span className="font-medium text-gray-800 dark:text-white">{user?.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="font-medium text-gray-800 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Rôle</span>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium w-fit">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              {darkMode ? <Moon size={20} className="text-purple-700 dark:text-purple-400" /> : <Sun size={20} className="text-purple-700" />}
            </div>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Apparence</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <p className="font-medium text-gray-800 dark:text-white text-sm">Mode sombre</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Thème sombre pour l'interface</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition w-fit"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm">{darkMode ? "Mode clair" : "Mode sombre"}</span>
            </button>
          </div>
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

        {/* Bouton Sauvegarder */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-medium w-full sm:w-auto"
          >
            Sauvegarder les paramètres
          </button>
        </div>

      </div>
    </div>
  );
}