"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  BarChart2,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Déconnexion — supprime le token et redirige vers /login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/Ceo" },
    { icon: TrendingUp, label: "Burn vs Earn", href: "/dashboard/Ceo/burn-vs-earn" },
    { icon: Clock, label: "AR Aging", href: "/dashboard/Ceo/ar-aging" },
    { icon: BarChart2, label: "Analytique", href: "/dashboard/Ceo/analytics" },
    { icon: CreditCard, label: "QuickBooks", href: "/dashboard/Ceo/quickbooks" },
    { icon: Settings, label: "Paramètres", href: "/dashboard/Ceo/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* ── Sidebar ── */}
      <aside
        className={`
          flex flex-col justify-between
          bg-gray-900 text-white
          transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {/* Top — Logo + Menu */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-700">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center font-bold text-sm">
             <img
                        src="/logo.png"
                        alt="Agri-FinOps Logo"
                        width={40}
                        height={40}
                    />
            </div>
            {!collapsed && (
              <div>
                <p className="font-bold text-sm">Agri-FinOps</p>
                <p className="text-xs text-gray-400">B264 Dashboard</p>
              </div>
            )}
          </div>

          {/* User Info */}
          {!collapsed && user && (
            <div className="p-4 border-b border-gray-700">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          )}

          {/* Menu Items */}
          <nav className="mt-4 space-y-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition text-sm"
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom — Collapse + Logout */}
        <div className="p-2 border-t border-gray-700 space-y-1">
          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition text-sm"
          >
            <ChevronLeft size={18} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Réduire</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition text-sm"
          >
            <LogOut size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  );
}