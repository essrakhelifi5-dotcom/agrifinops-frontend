"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, X, Send, RefreshCw, BarChart2 } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface DashboardData {
  kpis?: {
    totalAR: number;
    burnRate: number;
    monthlyRevenue: number;
    quickRatio: number;
    runway: number;
    unpaidInvoicesCount: number;
  };
  burnVsEarn?: { month: string; revenue: number; expenses: number; profit: number }[];
  arAging?: { label: string; count: number; total: number }[];
  categoryMargins?: { category: string; amount: number; percentage: number }[];
}

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Bonjour ! Je suis votre assistant Agri-FinOps intelligent.\n\nJe peux :\n• 📊 Analyser et expliquer vos données financières en temps réel\n• 💡 Répondre à toutes vos questions (finance, agriculture, général)\n• 🔍 Détecter des anomalies dans vos KPIs\n\nCliquez sur l'icône 📊 en haut pour charger vos données, puis posez-moi n'importe quelle question !",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "⚠️ Vous devez être connecté pour charger les données du dashboard.",
        }]);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const base = 'http://localhost:3001';

      const [kpisRes, burnRes, agingRes, categoryRes] = await Promise.all([
        fetch(`${base}/analytics/kpis`, { headers }),
        fetch(`${base}/analytics/burn-vs-earn`, { headers }),
        fetch(`${base}/analytics/ar-aging`, { headers }),
        fetch(`${base}/analytics/category-margins`, { headers }),
      ]);

      const [kpis, burnVsEarn, arAging, categoryMargins] = await Promise.all([
        kpisRes.json(),
        burnRes.json(),
        agingRes.json(),
        categoryRes.json(),
      ]);

      const data: DashboardData = {
        kpis,
        burnVsEarn: burnVsEarn.data,
        arAging: arAging.data,
        categoryMargins: categoryMargins.data,
      };

      setDashboardData(data);
      setDataLoaded(true);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Données dashboard chargées !\n\n📊 **Résumé de vos KPIs :**\n• 🔥 Burn Rate : ${kpis.burnRate?.toFixed(2)} TND/mois\n• ⚡ Quick Ratio : ${kpis.quickRatio}\n• 🛤️ Runway : ${kpis.runway} mois\n• 💰 Revenus mensuels : ${kpis.monthlyRevenue?.toFixed(2)} TND\n• 📋 Factures impayées : ${kpis.totalAR?.toFixed(2)} TND (${kpis.unpaidInvoicesCount} factures)\n\nPosez-moi vos questions ou cliquez sur une suggestion ! 👇`,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "❌ Impossible de charger les données. Vérifiez que votre backend tourne sur le port 3001.",
      }]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          dashboardData: dataLoaded ? dashboardData : null,
        }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content ?? "Désolé, je n'ai pas pu répondre.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "❌ Erreur réseau. Vérifiez votre connexion.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Explique mes KPIs",
    "Mon burn rate est-il bon ?",
    "Analyse mes dépenses par catégorie",
    "Quel est mon runway ?",
    "Quelles factures sont en retard ?",
    "Comment améliorer mon quick ratio ?",
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition z-50 animate-bounce"
          title="Ouvrir l'assistant IA"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[650px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-sm">Assistant Agri-FinOps</p>
                <p className="text-[10px] text-green-100 uppercase tracking-wider">
                  {dataLoaded ? '✅ Dashboard connecté' : 'IA · Propulsé par Groq LLaMA'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadDashboardData}
                disabled={loadingData}
                title={dataLoaded ? "Rafraîchir les données" : "Charger les données du dashboard"}
                className="hover:bg-green-800 p-1.5 rounded transition disabled:opacity-50 flex items-center gap-1"
              >
                {loadingData
                  ? <RefreshCw size={16} className="animate-spin" />
                  : <BarChart2 size={16} />
                }
                <span className="text-[10px]">{dataLoaded ? 'Sync' : 'Dashboard'}</span>
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-green-800 p-1 rounded transition ml-1">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      m.role === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {m.role === 'user' ? 'MOI' : 'AI'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-green-700 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions rapides — visibles uniquement si données chargées */}
          {dataLoaded && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 scrollbar-hide">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dataLoaded ? "Ex: Explique mon burn rate..." : "Posez n'importe quelle question..."}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-green-700 text-white p-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              {dataLoaded ? '📊 Dashboard connecté · Analyse en temps réel' : "Cliquez sur Dashboard pour connecter vos données"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;