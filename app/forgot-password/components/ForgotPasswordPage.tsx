"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
//ArrowLeft	Icône du bouton retour
import { ArrowLeft, Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  //Cette variable indique l’étape actuelle du processus.
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  //Indique si une requête est en cours.
  const [loading, setLoading] = useState(false);
  //Stocke les messages d'erreur ou de succès à afficher à l'utilisateur.
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── ÉTAPE 1 : Demande de code ──
  //Cette fonction est appelée quand l’utilisateur entre son email et clique sur “Envoyer le code”.
  const handleRequestCode = async (e: React.FormEvent) => {
    //Empêche le formulaire de recharger la page.
    e.preventDefault();
    //On efface les anciens messages et on démarre le chargement.
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      //On envoie une requête au backend pour demander un code de réinitialisation.
      const response = await fetch("http://localhost:3001/password-reset/request", {
        method: "POST",
        //On dit au serveur que les données envoyées sont au format JSON.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      //On récupère la réponse du serveur et on la transforme en objet JavaScript.
      const data = await response.json();
    //Si la réponse du serveur n’est pas bonne, on déclenche une erreur.
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi du code");
      }
    //Si tout va bien, on affiche un message de succès.
     setSuccess("✅ Code envoyé ! Vérifiez votre email.");
     //Après 1,5 seconde, on passe à l’étape 2.
      setTimeout(() => setStep(2), 1500);
    } catch (err: any) {
      //Si une erreur arrive, on affiche son message.
      setError(err.message);
    } finally {
      //À la fin, on arrête le chargement.
      setLoading(false);
    }
  };

  // ── ÉTAPE 2 : Vérification du code ──
  // fonction appelée quand l’utilisateur entre le code reçu par email et clique sur “Vérifier le code”.
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      //Elle envoie une requête POST vers :
      const response = await fetch("http://localhost:3001/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Code invalide");
      }

      setSuccess("✅ Code vérifié !");
      setTimeout(() => setStep(3), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── ÉTAPE 3 : Nouveau mot de passe ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setError("❌ Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la réinitialisation");
      }

      setSuccess("✅ Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDE */}
      <div className="w-1/2 bg-green-700 text-white flex flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-xl font-bold">Agri-FinOps</h1>
        </div>

        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Réinitialisation<br />de mot de passe
          </h2>
          <p className="text-lg text-green-100">
            Suivez les étapes pour récupérer l'accès à votre compte.
          </p>
        </div>

        <p className="text-sm text-green-200">© 2026 Agri-FinOps</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg w-[450px]">
          {/* Bouton retour */}
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-sm"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </button>

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s
                      ? "bg-green-700 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      step > s ? "bg-green-700" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {/* ÉTAPE 1 : Email */}
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <h2 className="text-2xl font-bold mb-2">Entrez votre email</h2>
              <p className="text-gray-500 text-sm mb-6">
                Nous vous enverrons un code de vérification
              </p>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="votre-email@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le code"}
              </button>
            </form>
          )}

          {/* ÉTAPE 2 : Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <h2 className="text-2xl font-bold mb-2">Entrez le code</h2>
              <p className="text-gray-500 text-sm mb-6">
                Code envoyé à <strong>{email}</strong>
              </p>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium">Code (6 chiffres)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 border rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-400 mt-2">Le code expire dans 15 minutes</p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Vérifier le code"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 text-sm"
              >
                Renvoyer un code
              </button>
            </form>
          )}

          {/* ÉTAPE 3 : Nouveau mot de passe */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <h2 className="text-2xl font-bold mb-2">Nouveau mot de passe</h2>
              <p className="text-gray-500 text-sm mb-6">
                Choisissez un mot de passe sécurisé
              </p>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium">Confirmer le mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Retapez le mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}