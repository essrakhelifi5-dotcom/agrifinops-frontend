"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function ManagerArAgingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getArAging();
        setData(result.data || []);
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

  const totalAR = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">AR Aging</h1>
        <p className="text-gray-500 text-sm mt-1">Suivi des paiements en retard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {data.map((item: any) => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
            <p className="text-2xl font-bold text-gray-800">${item.total.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">{item.count} factures</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Total AR : <span className="text-red-500">${totalAR.toFixed(2)}</span>
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => [`$${value}`, 'Total']} />
            <Bar dataKey="total" fill="#f59e0b" name="Total ($)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Détail par tranche</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-gray-500 font-medium">Tranche</th>
              <th className="p-3 text-right text-gray-500 font-medium">Nb Factures</th>
              <th className="p-3 text-right text-gray-500 font-medium">Total</th>
              <th className="p-3 text-right text-gray-500 font-medium">% AR</th>
              <th className="p-3 text-center text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any) => (
              <tr key={item.label} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-700">{item.label}</td>
                <td className="p-3 text-right text-gray-600">{item.count}</td>
                <td className="p-3 text-right font-medium">${item.total.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-600">
                  {totalAR > 0 ? ((item.total / totalAR) * 100).toFixed(1) : 0}%
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.label === '0-30 jours' ? 'bg-green-50 text-green-600' :
                    item.label === '31-60 jours' ? 'bg-yellow-50 text-yellow-600' :
                    item.label === '61-90 jours' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {item.label === '0-30 jours' ? '✅ Normal' :
                     item.label === '31-60 jours' ? '⚠️ Relancer' :
                     item.label === '61-90 jours' ? '🔴 Urgent' : '🚨 Critique'}
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