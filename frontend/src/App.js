import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

const App = () => {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/chat" replace />
                        ) : (
                            <LoginPage onLogin={(userData) => setUser(userData)} />
                        )
                    }
                />
                <Route
                    path="/chat"
                    element={
                        user ? (
                            <ChatPage user={user} />
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