const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


// ── Fonction utilitaire en dehors de l'objet ──
// Récupère le token JWT depuis localStorage
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const api = {

  // ─────────────────────────────────────────────
  // AUTH : Inscription
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // AUTH : Connexion
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // QUICKBOOKS : URL de connexion OAuth
  // ─────────────────────────────────────────────
  getQuickBooksAuthUrl() {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("token");
    return `${API_URL}/quickbooks/auth?token=${token}`;
  },

  // ─────────────────────────────────────────────
  // QUICKBOOKS : Infos de l'entreprise
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // ANALYTICS : KPIs
  // ─────────────────────────────────────────────
  async getKpis() {
    const response = await fetch(`${API_URL}/analytics/kpis`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur KPIs");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : Burn vs Earn
  // ─────────────────────────────────────────────
  async getBurnVsEarn() {
    const response = await fetch(`${API_URL}/analytics/burn-vs-earn`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Burn vs Earn");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : Category Margins
  // ─────────────────────────────────────────────
  async getCategoryMargins() {
    const response = await fetch(`${API_URL}/analytics/category-margins`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Category Margins");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : AR Aging
  // ─────────────────────────────────────────────
  async getArAging() {
    const response = await fetch(`${API_URL}/analytics/ar-aging`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur AR Aging");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : Financial Ratios via Python
  // ─────────────────────────────────────────────
  async getFinancialRatios() {
    const response = await fetch(`${API_URL}/analytics/financial-ratios`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Financial Ratios");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : Prédiction Cash Flow via Python
  // ─────────────────────────────────────────────
  async getPredictCashFlow() {
    const response = await fetch(`${API_URL}/analytics/predict-cashflow`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Predict Cash Flow");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // ANALYTICS : Catégorisation IA via Python
  // ─────────────────────────────────────────────
  async categorizeIA() {
    const response = await fetch(`${API_URL}/analytics/categorize-ia`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Categorize IA");
    return response.json();
  },

  // ─────────────────────────────────────────────
  // SYNC : Synchronisation complète
  // ─────────────────────────────────────────────
  async syncAll() {
    const response = await fetch(`${API_URL}/sync/all`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur Sync");
    return response.json();
  },




  // ADMIN : Gestion utilisateurs
// ─────────────────────────────────────────────

// BF6 : Statistiques système
async getAdminStats() {
  const response = await fetch(`${API_URL}/admin/stats`, {
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

// BF2 : Créer utilisateur
async createUser(name: string, email: string, password: string, role: string) {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur création utilisateur");
  }
  return response.json();
},

// BF3 : Modifier utilisateur
async updateUser(userId: string, data: { name?: string; email?: string; role?: string }) {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erreur modification utilisateur");
  return response.json();
},

// BF4 : Supprimer utilisateur
async deleteUser(userId: string) {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur suppression utilisateur");
  return response.json();
},

// BF5 : Activer/Désactiver compte
async toggleUserStatus(userId: string, isActive: boolean) {
  const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) throw new Error("Erreur changement statut");
  return response.json();
},

};