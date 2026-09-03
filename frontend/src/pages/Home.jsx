import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, CalendarDays, Flag, FileSignature, Vote, HandHeart,
    MessagesSquare, Search, TrendingUp, ShieldCheck, Users, Sparkles,
} from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import './Home.css';

const MODULES = [
    { to: '/issues', title: 'Report Issues', description: 'Flag potholes, broken lights, and safety hazards — then track them to resolution.', icon: Flag, keywords: 'pothole report track fix street problem' },
    { to: '/forums', title: 'Community Forums', description: 'Discuss ideas and neighbourhood topics in threaded conversations.', icon: MessagesSquare, keywords: 'discuss talk thread community topic' },
    { to: '/events', title: 'Community Events', description: 'Discover town halls and cleanups, see who is going, and RSVP in one click.', icon: CalendarDays, keywords: 'town hall meetup rsvp calendar gather' },
    { to: '/petitions', title: 'Petitions', description: 'Start or sign petitions and watch signatures climb toward the goal.', icon: FileSignature, keywords: 'sign campaign change demand goal' },
    { to: '/polls', title: 'Polls', description: 'Shape local decisions with quick votes and real-time results.', icon: Vote, keywords: 'vote decision survey opinion result' },
    { to: '/volunteers', title: 'Volunteering', description: 'Offer your time to education, healthcare, and community service initiatives.', icon: HandHeart, keywords: 'help signup ngo serve give time' },
];

const ROTATING_LINES = [
    'report the issues you see.',
    'shape budgets in town halls.',
    'sign petitions that get noticed.',
    'volunteer where it matters.',
];

const STATS = [
    { icon: Users, label: 'Citizens engaged' },
    { icon: TrendingUp, label: 'Issues resolved' },
    { icon: ShieldCheck, label: 'Transparent tracking' },
];

const Home = () => {
    const [lineIndex, setLineIndex] = useState(0);
    const [now, setNow] = useState(new Date());
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const heroRef = useRef(null);

    useEffect(() => {
        const lineTimer = setInterval(() => setLineIndex((i) => (i + 1) % ROTATING_LINES.length), 2600);
        const clockTimer = setInterval(() => setNow(new Date()), 30000);
        return () => {
            clearInterval(lineTimer);
            clearInterval(clockTimer);
        };
    }, []);

    // Gentle parallax on the hero glow blobs
    useEffect(() => {
        const onMove = (e) => {
            if (!heroRef.current) return;
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 18;
            const y = (e.clientY / innerHeight - 0.5) * 18;
            heroRef.current.style.setProperty('--px', `${x}px`);
            heroRef.current.style.setProperty('--py', `${y}px`);
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return MODULES.filter(
            (m) => m.title.toLowerCase().includes(q) || m.keywords.includes(q) || m.description.toLowerCase().includes(q)
        ).slice(0, 4);
    }, [query]);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        if (results.length > 0) navigate(results[0].to);
    };

    const dateLine = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const timeLine = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="home">
            {/* ---------- Hero ---------- */}
            <section className="hero" ref={heroRef}>
                <div className="hero__glow hero__glow--1" aria-hidden="true" />
                <div className="hero__glow hero__glow--2" aria-hidden="true" />
                <div className="hero__grid-lines" aria-hidden="true" />

                <div className="container hero__inner">
                    <div className="hero__badge">
                        <Sparkles size={14} />
                        <span>Your city, your voice</span>
                    </div>

                    <h1 className="hero__title">
                        Civic engagement,
                        <br />
                        made <span className="hero__title-accent">effortless.</span>
                    </h1>

                    <p className="hero__subtitle">
                        Urban Engage connects citizens with local authorities — one platform to{' '}
                        <span className="hero__rotator" key={lineIndex}>
                            {ROTATING_LINES[lineIndex]}
                        </span>
                    </p>

                    <form className="hero__search" onSubmit={onSearchSubmit} role="search">
                        <Search size={18} className="hero__search-icon" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the platform — issues, events, polls…"
                            aria-label="Search the platform"
                        />
                        {results.length > 0 && (
                            <ul className="hero__results">
                                {results.map((r) => (
                                    <li key={r.to}>
                                        <button type="button" onClick={() => navigate(r.to)}>
                                            <r.icon size={16} />
                                            <span>{r.title}</span>
                                            <ArrowRight size={14} className="hero__results-arrow" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </form>

                    <div className="hero__cta">
                        <Link to="/issues" className="btn btn--primary btn--lg">
                            Report an issue <ArrowRight size={18} />
                        </Link>
                        <Link to="/dashboard" className="btn btn--hero-ghost btn--lg">
                            Explore the dashboard
                        </Link>
                    </div>

                    <div className="hero__meta">
                        {STATS.map(({ icon: Icon, label }) => (
                            <span key={label} className="hero__meta-item">
                                <Icon size={15} /> {label}
                            </span>
                        ))}
                        <span className="hero__meta-item hero__meta-item--time">
                            {dateLine} · {timeLine}
                        </span>
                    </div>
                </div>

                <div className="hero__wave" aria-hidden="true">
                    <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
                        <path
                            d="M0,64 C240,20 480,10 720,32 C960,54 1200,74 1440,44 L1440,90 L0,90 Z"
                            fill="var(--bg)"
                        />
                    </svg>
                </div>
            </section>

            {/* ---------- Modules ---------- */}
            <section className="container home__modules">
                <Reveal className="home__section-head">
                    <span className="eyebrow-pill">Everything in one place</span>
                    <h2>Pick a module, make a difference</h2>
                    <p>Six connected tools that take an issue from “someone should fix this” to “it’s done”.</p>
                </Reveal>

                <div className="card-grid">
                    {MODULES.map((mod, i) => (
                        <Reveal key={mod.to} delay={i * 70}>
                            <Link to={mod.to} className="module-card">
                                <span className="module-card__icon">
                                    <mod.icon size={23} strokeWidth={1.9} />
                                </span>
                                <h3>{mod.title}</h3>
                                <p>{mod.description}</p>
                                <span className="module-card__cta">
                                    Open <ArrowRight size={15} />
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ---------- How it works ---------- */}
            <section className="home__how">
                <div className="container">
                    <Reveal className="home__section-head">
                        <span className="eyebrow-pill">How it works</span>
                        <h2>From report to resolution</h2>
                    </Reveal>

                    <div className="how__steps">
                        {[
                            ['Spot', 'See a problem or an opportunity in your neighbourhood and open the right module.'],
                            ['Engage', 'Report it, discuss it, or rally support through petitions and polls.'],
                            ['Track', 'Follow status updates from “Open” to “Resolved” — fully transparent.'],
                        ].map(([title, text], i) => (
                            <Reveal key={title} delay={i * 110} className="how__step">
                                <span className="how__num">{String(i + 1).padStart(2, '0')}</span>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- CTA band ---------- */}
            <section className="container">
                <Reveal className="home__cta-band">
                    <div className="home__cta-band-glow" aria-hidden="true" />
                    <h2>Ready to shape your city?</h2>
                    <p>Join your neighbours — create a free account and start engaging today.</p>
                    <Link to="/accounts" className="btn btn--light btn--lg">
                        Create your account <ArrowRight size={18} />
                    </Link>
                </Reveal>
            </section>
        </div>
    );
};

export default Home;
