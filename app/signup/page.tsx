"use client"

import { useState } from "react"
//	Appeler le backend pour créer le compte
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  //Le formulaire est stocké dans un seul état :
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CEO"
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
//Quand l’utilisateur clique sur Créer le compte, cette fonction est appelée 
  const handleSubmit = async (e: React.FormEvent) => {
    //commence par empêcher le rechargement de la page
    e.preventDefault()
    // elle remet les messages à zéro
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const response = await api.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      )

      // Sauvegarde le token
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Affiche le succès
      setSuccess(true)
      
      // Réinitialise le formulaire
      setFormData({ name: "", email: "", password: "", role: "CEO" })

      // Redirection automatique après 3 secondes
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="w-25 h-25 rounded-xl flex items-center justify-center mx-auto mb-3">
            <img
              src="/logo.png"
              alt="Agri-FinOps Logo"
              width={120}
              height={120}
            />
          </div>
          <h1 className="text-2xl font-bold">Agri-FinOps</h1>
          <p className="text-gray-500 text-sm">Créer un compte</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ Compte créé avec succès !<br />
            📧 Un email de bienvenue a été envoyé à <strong>{formData.email}</strong><br />
            <span className="text-xs">Redirection automatique vers login...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="votre-email@exemple.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              📧 Un email de bienvenue sera envoyé à cette adresse
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="CEO">Business Owner (CEO)</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Création en cours...' : success ? 'Compte créé ✓' : 'Créer le compte'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Déjà inscrit ?{" "}
            <a href="/login" className="text-green-700 font-medium hover:underline">
              Se connecter
            </a>
          </p>

        </form>
      </div>
    </div>
  )
}