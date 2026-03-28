const API_URL = "http://localhost:3001";

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
      headers: getAuthHeaders(), // ← sans "this"
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

};