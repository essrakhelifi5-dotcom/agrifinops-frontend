"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  UserPlus, Edit, Trash2, CheckCircle, XCircle, 
  Search, Filter 
} from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.log("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ BF5 : Toggle status FONCTIONNEL
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      // Recharge la liste pour voir le changement
      await loadUsers();
      
    } catch (error: any) {
      alert(error.message || "❌ Erreur lors du changement de statut");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ BF4 : Delete user FONCTIONNEL
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setActionLoading(userToDelete.id);
    try {
      await api.deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      await loadUsers();
     
    } catch (error: any) {
      alert(error.message || "❌ Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "all" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">BF1 : Consulter et gérer les utilisateurs</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/Admin/users/create")}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
        >
          <UserPlus size={18} />
          Créer Utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="CEO">CEO</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Utilisateur</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Rôle</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Statut</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date création</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{user.name}</p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </td>

                <td className="px-6 py-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${user.role === 'CEO' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : ''}
                    ${user.role === 'Manager' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''}
                    ${user.role === 'Admin' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : ''}
                  `}>
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Actif</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">Inactif</span>
                      </>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* BF3 : Modifier */}
                    <button
                      onClick={() => router.push(`/dashboard/Admin/users/edit/${user.id}`)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition group"
                      title="Modifier"
                    >
                      <Edit size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </button>

                    {/* ✅ BF5 : Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={actionLoading === user.id}
                      className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition group disabled:opacity-50"
                      title={user.isActive ? "Désactiver" : "Activer"}
                    >
                      {actionLoading === user.id ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : user.isActive ? (
                        <XCircle size={16} className="text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
                      ) : (
                        <CheckCircle size={16} className="text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                      )}
                    </button>

                    {/* BF4 : Supprimer */}
                    <button
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition group"
                      title="Supprimer"
                    >
                      <Trash2 size={16} className="text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === userToDelete?.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading === userToDelete?.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}