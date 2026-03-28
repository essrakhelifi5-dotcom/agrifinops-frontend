"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getCategoryMargins();
        setCategoryData(result.data || []);
      } catch (error) {
        console.log("Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Analytique</h1>
        <p className="text-gray-500 text-sm mt-1">Analyse des dépenses par catégorie</p>
      </div>

      {/* Category Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Dépenses par Catégorie</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={180} />
            <Tooltip />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} name="Montant ($)">
              {categoryData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Détail par catégorie</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Catégorie</th>
              <th className="p-3 text-right text-gray-500 font-medium">Montant</th>
              <th className="p-3 text-right text-gray-500 font-medium">Pourcentage</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((item: any, index: number) => (
              <tr key={item.category} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-700">{item.category}</span>
                </td>
                <td className="p-3 text-right text-gray-600">${item.amount.toFixed(2)}</td>
                <td className="p-3 text-right">
                  <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    {item.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}