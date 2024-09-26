import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Forums from './components/Forums';
import Events from './components/Events';
import Issues from './components/Issues';
import Petitions from './components/Petitions';
import Polls from './components/Polls';
import Volunteers from './components/Volunteers';
import Accounts from './components/Accounts';
import './App.css';

const App = () => {
    return (
        <Router>
            <div>
                <Header />
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
                </Routes>
            </div>
        </Router>
    );
};

export default App;
