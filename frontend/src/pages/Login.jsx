import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin
            ? 'http://localhost:5000/api/users/login'
            : 'http://localhost:5000/api/users/connect';

        try {
            const payload = isLogin
                ? { email, password }
                : { username, email, password };
            const res = await axios.post(endpoint, payload);
            if (isLogin) {
                onLogin(res.data.user);
            } else {
                alert('Inscription réussie, vous pouvez maintenant vous connecter.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-8">
                    {isLogin ? (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
                                    <input
                                        type="password"
                                        placeholder="Mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Se connecter
                                </button>
                                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Pseudo</label>
                                    <input
                                        type="text"
                                        placeholder="Pseudo"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
                                    <input
                                        type="password"
                                        placeholder="Mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                    S'inscrire
                                </button>
                                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                            </form>
                        </>
                    )}
                </div>
                <div className="py-4 bg-gray-200 text-center">
                    {isLogin ? (
                        <p className="text-sm">
                            Vous n'avez pas de compte ?{' '}
                            <button
                                className="text-blue-500 underline"
                                onClick={() => setIsLogin(false)}
                            >
                                Inscrivez-vous
                            </button>
                        </p>
                    ) : (
                        <p className="text-sm">
                            Vous avez déjà un compte ?{' '}
                            <button
                                className="text-green-500 underline"
                                onClick={() => setIsLogin(true)}
                            >
                                Connectez-vous
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;