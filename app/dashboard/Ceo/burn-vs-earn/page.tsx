//afficher les revenus, dépenses et profits par mois.
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function BurnVsEarnPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getBurnVsEarn();
        setData(result.data || []);
      } catch (error) {
        console.log("Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
 //Le graphique :LineChart affiche trois courbes :revenus, dépenses et profit. 
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Burn vs Earn</h1>
        <p className="text-gray-500 text-sm mt-1">Revenus vs Dépenses par mois</p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Cash Flow Overview</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenus" dot={true} />
            <Line type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={2} name="Dépenses" dot={true} />
            <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} name="Profit" dot={true} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Détail par mois</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Mois</th>
              <th className="p-3 text-right text-gray-500 font-medium">Revenus</th>
              <th className="p-3 text-right text-gray-500 font-medium">Dépenses</th>
              <th className="p-3 text-right text-gray-500 font-medium">Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any) => (
              <tr key={row.month} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{row.month}</td>
                <td className="p-3 text-right text-green-600">${row.revenue.toFixed(2)}</td>
                <td className="p-3 text-right text-blue-600">${row.expenses.toFixed(2)}</td>
          
                <td className={`p-3 text-right font-medium ${row.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${row.profit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}