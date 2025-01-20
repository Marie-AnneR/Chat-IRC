import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';

const App = () => {
    const [user, setUser] = useState(null);
    const handleLogin = (userData) => {
        setUser(userData);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/chat" replace />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/chat"
                    element={
                        user ? (
                            <Chat user={user} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;