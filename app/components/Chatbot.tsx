//Rôle général
//Le composant affiche un bouton rond en bas à droite. Quand on clique dessus, une fenêtre de chat s'ouvre.
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, X, Send, RefreshCw, BarChart2 } from "lucide-react";

//Cette interface décrit un message du chat (content contenu du msg ..)
interface Message {
  id: string;        // Identifiant unique du message
  role: 'user' | 'assistant';
  content: string;
}

//décrit les données financières que le chatbot peut charger
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

//États du composant
const Chat = () => {
  const [isOpen, setIsOpen] = useState(false); // Indique si la fenêtre du chatbot est ouverte

  // ─────────────────────────────────────────────────────
  // NOUVEAU : État pour stocker le rôle de l'utilisateur
  // On le lit depuis le token JWT stocké en localStorage
  // ─────────────────────────────────────────────────────
  const [userRole, setUserRole] = useState<string | null>(null);

  // Liste des messages affichés — initialisée avec le message de bienvenue
  // Le message de bienvenue sera différent selon le rôle (Admin ou CEO/Manager)
  // mais on ne connaît pas encore le rôle ici (il sera défini dans useEffect)
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');           // Texte tapé par l'utilisateur
  const [isLoading, setIsLoading] = useState(false); // Indique si l'IA est en train de répondre
  const [dashboardData, setDashboardData] = useState<DashboardData>({}); // Données financières chargées
  const [dataLoaded, setDataLoaded] = useState(false);   // Indique si les données dashboard sont disponibles
  const [loadingData, setLoadingData] = useState(false); // Indique si le chargement des données est en cours

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────
  // NOUVEAU : Lire le rôle depuis le token JWT au montage
  // Le token JWT contient un payload encodé en Base64.
  // On le découpe : token.split('.')[1] = la partie payload
  // atob() = décode le Base64 → JSON string
  // JSON.parse() = convertit en objet JavaScript
  // payload.role = le rôle de l'utilisateur (Admin, CEO, Manager)
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);

        // Message de bienvenue adapté selon le rôle
        // Admin → pas de bouton dashboard → message sans mention de l'icône 📊
        // CEO / Manager → ont accès au dashboard → message avec instruction
        const welcomeContent =
          payload.role === 'Admin'
            ? "👋 Bonjour ! Je suis votre assistant Agri-FinOps.\n\nJe peux :\n• 💡 Répondre à toutes vos questions générales\n• 🔍 Vous assister dans la gestion de la plateforme\n• 📋 Vous guider sur les fonctionnalités\n\nPosez-moi n'importe quelle question !"
            : "👋 Bonjour ! Je suis votre assistant Agri-FinOps intelligent.\n\nJe peux :\n• 📊 Analyser et expliquer vos données financières en temps réel\n• 💡 Répondre à toutes vos questions (finance, agriculture, général)\n• 🔍 Détecter des anomalies dans vos KPIs\n\nCliquez sur l'icône 📊 en haut pour charger vos données, puis posez-moi n'importe quelle question !";

        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: welcomeContent,
          },
        ]);
      } catch (error) {
        // Si la lecture du token échoue (token corrompu), on met un message par défaut
        console.error('Erreur lecture token', error);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: "👋 Bonjour ! Je suis votre assistant Agri-FinOps. Posez-moi n'importe quelle question !",
          },
        ]);
      }
    } else {
      // Pas de token → utilisateur non connecté → message générique
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "👋 Bonjour ! Je suis votre assistant Agri-FinOps. Posez-moi n'importe quelle question !",
        },
      ]);
    }
  }, []); // [] = s'exécute une seule fois au montage du composant

  // useEffect : À chaque nouveau message, la zone de chat descend automatiquement vers le dernier message.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ─────────────────────────────────────────────────────
  // Charge les données financières quand l'utilisateur clique sur le bouton Dashboard ou Sync
  // Cette fonction est UNIQUEMENT accessible aux CEO et Manager (le bouton est caché pour l'Admin)
  // ─────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Récupérer le token
      const token = localStorage.getItem('token');
      if (!token) {
        // Si aucun token n'existe, elle ajoute un message disant qu'il faut être connecté.
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "⚠️ Vous devez être connecté pour charger les données du dashboard.",
        }]);
        return;
      }

      // Sinon, elle appelle quatre endpoints backend :
      const headers = { Authorization: `Bearer ${token}` };
      const base = 'http://localhost:3001';

      // Promise.all = lance les 4 requêtes EN MÊME TEMPS (plus rapide que séquentiellement)
      const [kpisRes, burnRes, agingRes, categoryRes] = await Promise.all([
        fetch(`${base}/analytics/kpis`, { headers }),
        fetch(`${base}/analytics/burn-vs-earn`, { headers }),
        fetch(`${base}/analytics/ar-aging`, { headers }),
        fetch(`${base}/analytics/category-margins`, { headers }),
      ]);

      // Parse les 4 réponses JSON en parallèle
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

      // Affiche un résumé des KPIs dans le chat après chargement
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Données dashboard chargées !\n\n📊 **Résumé de vos KPIs :**\n• 🔥 Burn Rate : ${kpis.burnRate?.toFixed(2)} $/mois\n• ⚡ Quick Ratio : ${kpis.quickRatio}\n• 🛤️ Runway : ${kpis.runway} mois\n• 💰 Revenus mensuels : ${kpis.monthlyRevenue?.toFixed(2)} $\n• 📋 Factures impayées : ${kpis.totalAR?.toFixed(2)} $ (${kpis.unpaidInvoicesCount} factures)\n\nPosez-moi vos questions ou cliquez sur une suggestion ! 👇`,
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

  // Quand l'utilisateur envoie un message, cette fonction est appelée :
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page (comportement par défaut du formulaire)
    if (!input.trim() || isLoading) return; // Ne fait rien si le champ est vide ou si l'IA répond déjà

    // Crée d'abord un message utilisateur :
    const userMsg: Message = {
      id: Date.now().toString(), // ID unique basé sur le timestamp
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMsg]; // Copie de la liste avec le nouveau message ajouté
    setMessages(updatedMessages);
    setInput('');          // Vide le champ de saisie
    setIsLoading(true);    // Active l'indicateur de chargement (les 3 points animés)

    try {
      // Elle envoie une requête POST vers /api/openai avec le message de l'utilisateur
      // et les données du dashboard (si elles sont chargées)
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          // Si les données dashboard sont chargées, on les envoie à l'IA pour le contexte
          dashboardData: dataLoaded ? dashboardData : null,
        }),
      });

      // Si la requête réussit, elle ajoute la réponse de l'IA à la liste des messages.
      // Sinon, elle affiche un message d'erreur.
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
      setIsLoading(false); // Désactive l'indicateur de chargement dans tous les cas
    }
  };

  // Suggestions rapides — affichées uniquement si les données sont chargées
  // Chaque suggestion remplit le champ input quand on clique dessus
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
      {/* Bouton flottant — visible seulement quand la fenêtre est fermée */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition z-50 animate-bounce"
          title="Ouvrir l'assistant IA"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Fenêtre de chat — visible seulement quand isOpen = true */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[650px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Point vert animé — indicateur de connexion */}
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-sm">Assistant Agri-FinOps</p>
                <p className="text-[10px] text-green-100 uppercase tracking-wider">
                  {/* Affiche le statut selon si les données sont chargées ou non */}
                  {dataLoaded ? '✅ Dashboard connecté' : 'IA · Propulsé par Groq LLaMA'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">

              {/* ─────────────────────────────────────────────────────
                  NOUVEAU : Bouton Dashboard caché pour l'Admin
                  userRole !== 'Admin' → visible pour CEO et Manager
                  userRole === 'Admin' → bouton masqué (null = rien affiché)
                  Ainsi l'Admin ne peut pas charger de données financières
                  ───────────────────────────────────────────────────── */}
              {userRole !== 'Admin' && (
                <button
                  onClick={loadDashboardData}
                  disabled={loadingData}
                  title={dataLoaded ? "Rafraîchir les données" : "Charger les données du dashboard"}
                  className="hover:bg-green-800 p-1.5 rounded transition disabled:opacity-50 flex items-center gap-1"
                >
                  {/* Icône animée pendant le chargement, icône normale sinon */}
                  {loadingData
                    ? <RefreshCw size={16} className="animate-spin" />
                    : <BarChart2 size={16} />
                  }
                  <span className="text-[10px]">{dataLoaded ? 'Sync' : 'Dashboard'}</span>
                </button>
              )}

              {/* Bouton fermer la fenêtre */}
              <button onClick={() => setIsOpen(false)} className="hover:bg-green-800 p-1 rounded transition ml-1">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Zone des messages — scrollable */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
          >
            {/* Affiche chaque message de la liste */}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    {/* Avatar : MOI (vert) pour l'utilisateur, AI (gris) pour l'assistant */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      m.role === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {m.role === 'user' ? 'MOI' : 'AI'}
                    </div>
                  </div>
                  {/* Bulle de message — verte pour l'utilisateur, blanche pour l'assistant */}
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

            {/* Indicateur de chargement (3 points animés) — visible quand l'IA répond */}
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

          {/* Suggestions rapides — visibles uniquement si données chargées ET utilisateur pas Admin */}
          {dataLoaded && userRole !== 'Admin' && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 scrollbar-hide">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)} // Remplit le champ input avec la suggestion
                  className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Zone de saisie du message */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                // Placeholder différent selon si les données sont chargées ou non
                placeholder={dataLoaded ? "Ex: Explique mon burn rate..." : "Posez n'importe quelle question..."}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {/* Bouton envoyer — désactivé si champ vide ou si l'IA répond déjà */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-green-700 text-white p-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
            {/* Message d'aide en bas — différent selon l'état de connexion au dashboard */}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              {dataLoaded
                ? '📊 Dashboard connecté · Analyse en temps réel'
                : userRole === 'Admin'
                  ? "Assistant général · Posez vos questions"
                  : "Cliquez sur Dashboard pour connecter vos données"
              }
            </p>
          </div>

        </div>
      )}
    </>
  );
};

export default Chat;