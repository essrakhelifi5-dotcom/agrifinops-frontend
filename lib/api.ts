//role fichier : le service central des appels API du frontend.
// role :regrouper toutes les fonctions qui communiquent avec le backend : login, signup, dashboard,
//Cette ligne définit l’adresse du backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fonction utilitaire : Headers avec JWT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//Cette fonction prépare les headers pour les routes protégées.
//Elle récupère le token dans localStorage, puis ajoute :
//Cela permet au backend de savoir quel utilisateur fait la requête.
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
//Le fichier exporte un objet api qui contient toutes les fonctions utilisées dans le projet.
export const api = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 AUTHENTIFICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Inscription
  async signup(name: string, email: string, password: string, role: string) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de la création du compte");
    }
    return response.json();
  },

  // Connexion
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Email ou mot de passe incorrect");
    }
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔗 QUICKBOOKS INTEGRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // URL de connexion OAuth QuickBooks
  getQuickBooksAuthUrl() {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("token");
    return `${API_URL}/quickbooks/auth?token=${token}`;
  },

  // Infos entreprise QuickBooks
  async getCompanyInfo() {
    const response = await fetch(`${API_URL}/quickbooks/company-info`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur récupération company info");
    }
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 ANALYTICS & KPIs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // KPIs principaux (Burn Rate, Quick Ratio, Runway, Total AR)
  async getKpis() {
    const response = await fetch(`${API_URL}/analytics/kpis`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur KPIs");
    return response.json();
  },

  // Burn vs Earn (Revenus vs Dépenses par mois)
  async getBurnVsEarn() {
    const response = await fetch(`${API_URL}/analytics/burn-vs-earn`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Burn vs Earn");
    return response.json();
  },

  // Category Margins (Dépenses par catégorie avec %)
  async getCategoryMargins() {
    const response = await fetch(`${API_URL}/analytics/category-margins`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Category Margins");
    return response.json();
  },

  // AR Aging (Factures impayées par tranche)
  async getArAging() {
    const response = await fetch(`${API_URL}/analytics/ar-aging`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur AR Aging");
    return response.json();
  },

  // Financial Ratios (via Python FastAPI)
  async getFinancialRatios() {
    const response = await fetch(`${API_URL}/analytics/financial-ratios`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Financial Ratios");
    return response.json();
  },

  // Prédiction Cash Flow (via Python FastAPI)
  async getPredictCashFlow() {
    const response = await fetch(`${API_URL}/analytics/predict-cashflow`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Predict Cash Flow");
    return response.json();
  },

  // Catégorisation IA (via Python FastAPI)
  async categorizeIA() {
    const response = await fetch(`${API_URL}/analytics/categorize-ia`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Categorize IA");
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔄 SYNCHRONISATION QUICKBOOKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Synchronisation complète (Invoices, Expenses, Payments)
  async syncAll() {
    const response = await fetch(`${API_URL}/sync/all`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Sync");
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 ADMIN : GESTION UTILISATEURS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // BF6 : Statistiques système (avec filtre company optionnel)
  async getAdminStats(company?: string) {
    const url = company 
      ? `${API_URL}/admin/stats?company=${company}`
      : `${API_URL}/admin/stats`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur stats");
    return response.json();
  },

  // BF1 : Liste utilisateurs
  async getUsers() {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur liste utilisateurs");
    return response.json();
  },

  // BF2 : Créer utilisateur (avec company)
  async createUser(
    name: string,
    email: string,
    password: string,
    role: string,
    company: string,  // ✅ AJOUT COMPANY
  ) {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password, role, company }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur création utilisateur");
    }
    return response.json();
  },

  // BF3 : Modifier utilisateur (avec company)
  async updateUser(
    userId: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      company?: string;  // ✅ AJOUT COMPANY
    },
  ) {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur modification utilisateur");
    }
    return response.json();
  },

  // BF4 : Supprimer utilisateur
  async deleteUser(userId: string) {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur suppression utilisateur");
    }
    return response.json();
  },

  // BF5 : Activer/Désactiver compte
  async toggleUserStatus(userId: string, isActive: boolean) {
    const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur changement statut");
    }
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔑 PASSWORD RESET
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Demande code reset
  async requestPasswordReset(email: string) {
    const response = await fetch(`${API_URL}/password-reset/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur demande reset");
    }
    return response.json();
  },

  // Vérifier code
  async verifyResetCode(email: string, code: string) {
    const response = await fetch(`${API_URL}/password-reset/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Code invalide");
    }
    return response.json();
  },

  // Réinitialiser password
  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await fetch(`${API_URL}/password-reset/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur reset password");
    }
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 CHATBOT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Envoyer message au chatbot
  async sendChatMessage(message: string) {
    const response = await fetch(`${API_URL}/chatbot/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error("Erreur chatbot");
    return response.json();
  },

  // Effacer historique chatbot
  async clearChatHistory() {
    const response = await fetch(`${API_URL}/chatbot/clear`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur clear history");
    return response.json();
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📄 EXPORT PDF
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Télécharger rapport PDF
  async downloadPDFReport() {
    const token = localStorage.getItem("token");
    const url = `${API_URL}/analytics/export-report?token=${token}`;
    
    // Ouvrir dans un nouvel onglet pour téléchargement
    window.open(url, "_blank");
  },
};