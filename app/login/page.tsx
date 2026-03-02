"use client";

import { useState } from "react";
import image from "next/image"

export default function LoginPage() {
    const [email, setEmail] = useState("ceo@agrifinops.com");
    const [password, setPassword] = useState("password");

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
                        />
                    </div>

                    {/* Button */}
                    <button className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition flex justify-center items-center gap-2">
                        Se connecter →
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pas encore de compte ?{" "}
                        <span className="text-green-700 font-medium cursor-pointer">
                            Créer un compte
                        </span>
                    </p>

                </div>
            </div>
        </div>
    );
}