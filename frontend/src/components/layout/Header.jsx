import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, MessagesSquare, CalendarDays, Flag, FileSignature, Vote, HandHeart, CircleUserRound, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';
import './Header.css';

const NAV_ITEMS = [
    { to: '/', label: 'Home', end: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forums', label: 'Forums', icon: MessagesSquare },
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/issues', label: 'Issues', icon: Flag },
    { to: '/petitions', label: 'Petitions', icon: FileSignature },
    { to: '/polls', label: 'Polls', icon: Vote },
    { to: '/volunteers', label: 'Volunteers', icon: HandHeart },
];

const Header = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, isLoggedIn } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Portaled to <body>: the header's backdrop-filter makes it the containing
    // block for position: fixed children, which would collapse the drawer.
    const drawer = open
        ? createPortal(
            <div className="header__drawer">
                <nav aria-label="Mobile">
                    {NAV_ITEMS.map(({ to, label, icon: Icon, end }, i) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `drawer__link ${isActive ? 'drawer__link--active' : ''}`}
                            style={{ animationDelay: `${i * 30}ms` }}
                        >
                            {Icon && <Icon size={18} />}
                            {label}
                        </NavLink>
                    ))}
                    <NavLink to="/accounts" className={({ isActive }) => `drawer__link ${isActive ? 'drawer__link--active' : ''}`}>
                        <CircleUserRound size={18} />
                        {isLoggedIn ? `Account (${user.name})` : 'Sign in'}
                    </NavLink>
                </nav>
            </div>,
            document.body
        )
        : null;

    return (
        <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
            <div className="header__inner container">
                <Link to="/" className="header__brand" aria-label="Urban Engage home">
                    <span className="header__logo">
                        <Landmark size={21} strokeWidth={2.1} />
                    </span>
                    <span className="header__brand-text">
                        <strong>Urban Engage</strong>
                        <small>e-Governance Platform</small>
                    </span>
                </Link>

                <nav className="header__nav" aria-label="Primary">
                    {NAV_ITEMS.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="header__actions">
                    <NavLink
                        to="/accounts"
                        className={({ isActive }) => `header__account ${isActive ? 'header__account--active' : ''}`}
                        aria-label="Your account"
                    >
                        {isLoggedIn ? (
                            <span className="header__avatar" aria-hidden="true">{initials(user.name)}</span>
                        ) : (
                            <>
                                <CircleUserRound size={20} />
                                <span className="header__account-label">Sign in</span>
                            </>
                        )}
                    </NavLink>

                    <button
                        type="button"
                        className="header__burger"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {drawer}
        </header>
    );
};

export default Header;
