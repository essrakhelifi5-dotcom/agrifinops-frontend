"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManagerSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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
    </div>
  );
}
