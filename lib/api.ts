const API_URL = 'http://localhost:3001';

export const api = {
  // Signup
  async signup(name: string, email: string, password: string, role: string) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du compte');
    }

    return response.json();
  },

  // Login
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email ou mot de passe incorrect');
    }

    return response.json();
  },

  // QuickBooks Auth (pour plus tard)
  getQuickBooksAuthUrl() {
    return `${API_URL}/quickbooks/auth`;
  },
};