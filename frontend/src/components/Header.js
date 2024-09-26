import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.png';
import accIcon from '../assets/acc.png';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src={logo} alt="Urban Engage Logo" className="logo-img" />
                <div className="logo-text">
                    <h1>Urban Engage</h1>
                    <h2 className="logo-space">An e-Governance Platform</h2>
                </div>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/forums">Forums</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/issues">Issues</Link></li>
                <li><Link to="/petitions">Petitions</Link></li>
                <li><Link to="/polls">Polls</Link></li>
                <li><Link to="/volunteers">Volunteers</Link></li>
                <li>
                    <Link to="/accounts">
                        <img src={accIcon} alt="Accounts" className="account-icon" />
                    </Link>
                </li>
            </ul>
        </header>
    );
};

export default Header;
