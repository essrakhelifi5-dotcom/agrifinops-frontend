"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
//Les icônes viennent de lucide-react :
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  BarChart2,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Users,
  PieChart,
  Menu,
  X,
} from "lucide-react";
import Chatbot from "../components/Chatbot";

export default function DashboardLayout({
  //children représente la page affichée à l’intérieur du layout.
//Par exemple, si tu es sur /dashboard/Admin/users, alors children contient la page users.
children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    //Vérifie si l’utilisateur est connecté 
    const token = localStorage.getItem("token");
    //Récupère les infos utilisateur depuis localStorage
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);
  //supprime les données de connexion puis redirige vers login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };
//Affiche un menu différent selon le rôle :
//Admin voit :Statistiques Utilisateurs Dashboard 
  const getMenuItems = () => {
    if (user?.role === "Admin") {
      return [
        { icon: LayoutDashboard, label: "Statistiques", href: "/dashboard/Admin" },
        { icon: Users, label: "Utilisateurs", href: "/dashboard/Admin/users" },
        { icon: PieChart, label: "Dashboard", href: "/dashboard/Admin/stats" },
        { icon: Settings, label: "Paramètres", href: "/dashboard/Admin/settings" },
      ];
    }

    if (user?.role === "Manager") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/Manager" },
        { icon: Clock, label: "AR Aging", href: "/dashboard/Manager/ar-aging" },
        { icon: CreditCard, label: "Dépenses", href: "/dashboard/Manager/expense" },
        { icon: CreditCard, label: "QuickBooks", href: "/dashboard/Manager/quickbooks" },
        { icon: Settings, label: "Paramètres", href: "/dashboard/Manager/settings" },
      ];
    }


    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/Ceo" },
      { icon: TrendingUp, label: "Burn vs Earn", href: "/dashboard/Ceo/burn-vs-earn" },
      { icon: Clock, label: "AR Aging", href: "/dashboard/Ceo/ar-aging" },
      { icon: BarChart2, label: "Analytique", href: "/dashboard/Ceo/analytics" },
      { icon: CreditCard, label: "QuickBooks", href: "/dashboard/Ceo/quickbooks" },
      { icon: Settings, label: "Paramètres", href: "/dashboard/Ceo/settings" },
    ];
  };

  const menuItems = getMenuItems();

  if (!mounted) return null;

  return (
    //construit le layout responsive avec sidebar desktop/mobile.
    <div className="flex h-screen bg-gray-100">
      {/* HEADER MOBILE */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-700 rounded-lg"></div>
          <span className="font-bold text-sm">Agri-FinOps</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-40
          flex flex-col justify-between
          bg-gray-900 text-white
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          w-72
        `}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Logo Desktop */}
          <div className="hidden lg:flex items-center gap-3 p-4 border-b border-gray-700">
            <div className="w-10 h-10 bg-green-700 rounded-lg"></div>
            {!collapsed && (
              <div>
                <p className="font-bold text-sm">Agri-FinOps</p>
                <p className="text-xs text-gray-400">B264 Dashboard</p>
              </div>
            )}
          </div>

          {/* User Info Mobile */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-700 mt-16">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>

          {/* User Info Desktop */}
          {!collapsed && user && (
            <div className="hidden lg:block p-4 border-b border-gray-700">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          )}

          {/* Menu Items */}
          <nav className="mt-4 space-y-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm"
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-gray-700 space-y-1">
          {/* Collapse (Desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition text-sm"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Réduire</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition text-sm"
          >
            <LogOut size={20} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* OVERLAY (Mobile) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {children}
      </main>

      <Chatbot />
    </div>
  );
}
