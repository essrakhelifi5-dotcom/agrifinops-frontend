"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const response = await api.login(email, password);

            // Sauvegarde le token et les infos utilisateur
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Affiche le message de succès
            setSuccess(true);

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

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Agri-FinOps Logo"
                        width={40}
                        height={40}
                    />
                    <h1 className="text-xl font-bold text-white">
                        Agri-FinOps
                    </h1>
                </div>

                {/* Main Text */}
                <div>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        QuickBooks Automated <br />
                        Ledger & Cash Flow
                    </h2>

                    <p className="text-lg text-green-100">
                        Plateforme FinOps intelligente pour synchroniser,
                        analyser et optimiser vos finances agricoles.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-sm text-green-200">
                    © 2026 Agri-FinOps
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-1/2 flex items-center justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-lg w-[450px]">

                    <h2 className="text-3xl font-bold mb-2">
                        Connexion
                    </h2>

                    <p className="text-gray-500 mb-6">
                        Accédez à votre tableau de bord financier
                    </p>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                            ✅ Connexion réussie ! Bienvenue {JSON.parse(localStorage.getItem('user') || '{}').name}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            ❌ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition flex justify-center items-center gap-2 disabled:bg-gray-400"
                        >
                            {loading ? 'Connexion...' : 'Se connecter →'}
                        </button>

                    </form>
                    <button onClick={() => window.location.href = "http://localhost:3001/quickbooks/auth"}>
  Connect QuickBooks
</button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pas encore de compte ?{" "}
                        <a href="/signup" className="text-green-700 font-medium cursor-pointer hover:underline">
                            Créer un compte
                        </a>
                    </p>

                </div>
            </div>
        </div>
    );
}