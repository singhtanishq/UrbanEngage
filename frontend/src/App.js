import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Forums from './pages/Forums';
import Events from './pages/Events';
import Issues from './pages/Issues';
import Petitions from './pages/Petitions';
import Polls from './pages/Polls';
import Volunteers from './pages/Volunteers';
import Accounts from './pages/Accounts';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
};

const App = () => (
    <Router>
        <AuthProvider>
            <ToastProvider>
                <ScrollToTop />
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/forums" element={<Forums />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/issues" element={<Issues />} />
                        <Route path="/petitions" element={<Petitions />} />
                        <Route path="/polls" element={<Polls />} />
                        <Route path="/volunteers" element={<Volunteers />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </main>
                <Footer />
            </ToastProvider>
        </AuthProvider>
    </Router>
);

export default App;
