import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, CalendarDays, FileSignature, Flag, HandHeart, MessagesSquare,
    ArrowRight, Activity, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { fetchDashboardStats } from '../api/services';
import { useCountUp } from '../hooks/useCountUp';
import { numberFormat, formatRelative } from '../utils/format';
import Reveal from '../components/ui/Reveal';
import { SkeletonGrid, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import './Dashboard.css';

const STAT_CARDS = [
    { key: 'userCount', label: 'Registered Citizens', icon: Users, tint: 'teal' },
    { key: 'issueCount', label: 'Issues Reported', icon: Flag, tint: 'rose' },
    { key: 'eventCount', label: 'Community Events', icon: CalendarDays, tint: 'blue' },
    { key: 'petitionCount', label: 'Petitions Started', icon: FileSignature, tint: 'violet' },
    { key: 'volunteerCount', label: 'Volunteers Joined', icon: HandHeart, tint: 'amber' },
    { key: 'postCount', label: 'Forum Discussions', icon: MessagesSquare, tint: 'green' },
];

const ACTIVITY_ICON = { issue: Flag, event: CalendarDays, petition: FileSignature };

const StatCard = ({ stat, icon: Icon, label, tint, delay }) => {
    const value = useCountUp(stat?.value ?? 0, { start: stat !== null });
    return (
        <Reveal delay={delay}>
            <div className="stat-card dash-stat">
                <span className={`stat-card__icon dash-stat__icon dash-stat__icon--${tint}`}>
                    <Icon size={21} strokeWidth={2} />
                </span>
                <span className="stat-card__value">{numberFormat(value)}</span>
                <span className="stat-card__label">{label}</span>
            </div>
        </Reveal>
    );
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toast = useToast();

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setData(await fetchDashboardStats());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const stats = data
        ? STAT_CARDS.map((card) => ({ ...card, stat: { value: data.stats[card.key] ?? 0 } }))
        : STAT_CARDS.map((card) => ({ ...card, stat: null }));

    return (
        <div className="container page page-enter">
            <div className="toolbar dash-toolbar">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <span className="eyebrow">Overview</span>
                    <h1>Community Dashboard</h1>
                    <p className="page-desc">Live platform-wide activity across every module.</p>
                </div>
                <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => {
                        load();
                        toast.info('Dashboard refreshed');
                    }}
                >
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="dash-grid">
                    <SkeletonGrid count={6} lines={2} />
                </div>
            ) : (
                <>
                    <div className="dash-grid">
                        {stats.map(({ key, label, icon, tint, stat }, i) => (
                            <StatCard key={key} stat={stat} icon={icon} label={label} tint={tint} delay={i * 60} />
                        ))}
                    </div>

                    <div className="dash-lower">
                        <Reveal className="dash-activity">
                            <div className="dash-activity__head">
                                <h2><Activity size={19} /> Recent Activity</h2>
                                <span className="text-faint text-soft">Newest first</span>
                            </div>

                            {data.activities.length === 0 ? (
                                <p className="text-soft dash-activity__empty">
                                    Nothing yet — activity appears as citizens use the platform.
                                </p>
                            ) : (
                                <ul className="dash-activity__list">
                                    {data.activities.map((item, i) => {
                                        const Icon = ACTIVITY_ICON[item.type] || Activity;
                                        return (
                                            <li key={`${item.type}-${item.timestamp}-${i}`} className="dash-activity__item" style={{ animationDelay: `${i * 60}ms` }}>
                                                <span className={`dash-activity__icon dash-activity__icon--${item.type}`}>
                                                    <Icon size={16} />
                                                </span>
                                                <div className="dash-activity__body">
                                                    <strong>{item.title}</strong>
                                                    <p>{item.description}</p>
                                                </div>
                                                <time className="dash-activity__time">{formatRelative(item.timestamp)}</time>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </Reveal>

                        <Reveal delay={120} className="dash-quicklinks">
                            <h2>Jump back in</h2>
                            {[
                                ['Report an issue', 'Flag something that needs fixing', '/issues', Flag],
                                ['Join a discussion', 'Share your view in the forums', '/forums', MessagesSquare],
                                ['Sign a petition', 'Back causes you believe in', '/petitions', FileSignature],
                                ['RSVP to an event', 'Meet your neighbours', '/events', CalendarDays],
                            ].map(([title, desc, to, Icon], i) => (
                                <Link key={to} to={to} className="dash-quicklink" style={{ animationDelay: `${i * 70}ms` }}>
                                    <span className="dash-quicklink__icon"><Icon size={17} /></span>
                                    <span className="dash-quicklink__text">
                                        <strong>{title}</strong>
                                        <small>{desc}</small>
                                    </span>
                                    <ArrowRight size={16} />
                                </Link>
                            ))}
                        </Reveal>
                    </div>
                </>
            )}

            {!loading && !error && (data.stats.userCount === 0) && (
                <div className="dash-empty-note">
                    <AlertTriangle size={16} />
                    The platform is brand new — be the first to register and get things moving.
                </div>
            )}
        </div>
    );
};

export default Dashboard;
