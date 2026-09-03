import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ExternalLink } from 'lucide-react';
import './Footer.css';

const MODULES = [
    ['Forums', '/forums'],
    ['Events', '/events'],
    ['Issues', '/issues'],
    ['Petitions', '/petitions'],
    ['Polls', '/polls'],
    ['Volunteers', '/volunteers'],
];

const Footer = () => (
    <footer className="footer">
        <div className="container footer__inner">
            <div className="footer__brand">
                <span className="footer__logo">
                    <Landmark size={20} strokeWidth={2.1} />
                </span>
                <div>
                    <strong>Urban Engage</strong>
                    <p>Connecting citizens with local authorities — report, discuss, vote, and volunteer for a better city.</p>
                </div>
            </div>

            <div className="footer__col">
                <h4>Modules</h4>
                <ul>
                    {MODULES.map(([label, to]) => (
                        <li key={to}><Link to={to}>{label}</Link></li>
                    ))}
                </ul>
            </div>

            <div className="footer__col">
                <h4>Platform</h4>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/accounts">Your Account</Link></li>
                    <li>
                        <a href="https://github.com/singhtanishq/UrbanEngage" target="_blank" rel="noreferrer">
                            <ExternalLink size={14} /> GitHub
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div className="container footer__base">
            <span>© {new Date().getFullYear()} Urban Engage · MIT License</span>
            <span>Built for citizens, by citizens</span>
        </div>
    </footer>
);

export default Footer;
