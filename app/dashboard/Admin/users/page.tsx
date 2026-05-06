"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Users, UserPlus, Edit, Trash2, XCircle, CheckCircle, 
  Search, Filter, Building2 
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;  // ✅ AJOUT
  isActive: boolean;
  createdAt: string;
  invoiceCount: number;
  expenseCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");  // ✅ NOUVEAU FILTRE

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      await loadUsers();
      alert(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) return;

    try {
      await api.deleteUser(userId);
      await loadUsers();
      alert("Utilisateur supprimé");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // ✅ FILTRAGE PAR SEARCH + ROLE + COMPANY
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesCompany = companyFilter === "all" || user.company === companyFilter;  // ✅ NOUVEAU

    return matchesSearch && matchesRole && matchesCompany;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-blue-100 text-blue-700';
      case 'Manager': return 'bg-green-100 text-green-700';
      case 'Admin': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ✅ BADGE COMPANY
  const getCompanyBadgeColor = (company: string) => {
    return company === 'S1' 
      ? 'bg-purple-100 text-purple-700' 
      : 'bg-pink-100 text-pink-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-green-700" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredUsers.length} utilisateur(s) affiché(s)
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/Admin/users/create")}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 flex items-center gap-2 transition"
        >
          <UserPlus size={20} />
          Créer Utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filtre Rôle */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="CEO">CEO</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* ✅ Filtre Company */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="all">Toutes les companies</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Utilisateur</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Rôle</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Company</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Créé le</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  
                  {/* Nom + Avatar */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.invoiceCount} factures · {user.expenseCount} dépenses
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-4 text-sm text-gray-700">{user.email}</td>

                  {/* Rôle */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* ✅ Company */}
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCompanyBadgeColor(user.company)}`}>
                      {user.company}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      
                      {/* Modifier */}
                      <button
                        onClick={() => router.push(`/dashboard/Admin/users/edit/${user.id}`)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`p-2 rounded-lg transition ${user.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}