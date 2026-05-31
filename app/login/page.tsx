"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [animated, setAnimated] = useState(false);
    const router = useRouter();
//Quand la page s’ouvre :
//elle attend 1.5 seconde ;
//elle met animated à true ;
//cela déclenche l’animation visuelle.
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimated(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
//Quand l’utilisateur clique sur Se connecter, cette fonction est appelée :
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
            const role = response.user.role;

            setTimeout(() => {
    if (role === "CEO") {
        router.push("/dashboard/Ceo");
    } else if (role === "Admin") {
        router.push("/dashboard/Admin");
    } else {
        router.push("/dashboard/Manager");
    }
}, 1000);
        

        } catch (err: any) {
            setError(err.message || "Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100 overflow-hidden">

            {/* LEFT SIDE */}
            <div
                style={{
                    width: animated ? "50%" : "100%",
                    transition: "width 0.9s cubic-bezier(0.77, 0, 0.175, 1)",
                }}
                className="bg-green-700 text-white flex flex-col justify-between p-12 shrink-0"
            >
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <img
                        src="/logo.png"
                        alt="Agri-FinOps Logo"
                        className="w-14 h-14 object-contain"
                    />

                    <h1 className="text-3xl font-extrabold tracking-wide text-white">
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
            <div
                style={{
                    opacity: animated ? 1 : 0,
                    transition: "opacity 0.6s ease 0.7s",
                }}
                className="flex-1 flex items-center justify-center"
            >
                <div className="bg-white p-10 rounded-2xl shadow-lg w-[450px]">

                    <h2 className="text-3xl font-bold mb-2">
                        Connexion
                    </h2>

                    <p className="text-gray-500 mb-6">
                        Accédez à votre tableau de bord financier
                    </p>


                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                            ✅ Connexion réussie !
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            ❌ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">Mot de passe</label>
                            <input
                                type="password"
                                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end mb-6">
                            <a href="/forgot-password" className="text-sm text-green-700 hover:underline">
                                Mot de passe oublié ?
                            </a>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Connexion...' : 'Se connecter →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pas encore de compte ?{" "}
                        <a href="/signup" className="text-green-700 font-medium hover:underline">
                            Créer un compte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}