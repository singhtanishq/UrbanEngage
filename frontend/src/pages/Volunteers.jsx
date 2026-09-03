import React, { useEffect, useMemo, useState } from 'react';
import { HandHeart, UserPlus, Mail, Clock3, Award, SearchX } from 'lucide-react';
import { fetchVolunteers, registerVolunteer } from '../api/services';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/format';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonGrid, ErrorState } from '../components/ui/States';
import './Volunteers.css';

const CATEGORIES = ['Education', 'Community Service', 'Healthcare'];

const Volunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    const [form, setForm] = useState({ name: '', email: '', category: '', experience: '', availability: '' });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setVolunteers(await fetchVolunteers(sortBy, 'desc', category));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, sortBy]);

    const grouped = useMemo(() => {
        const map = {};
        volunteers.forEach((volunteer) => {
            (map[volunteer.category] = map[volunteer.category] || []).push(volunteer);
        });
        return map;
    }, [volunteers]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await registerVolunteer(form);
            toast.success('Welcome aboard — registration complete!');
            setShowForm(false);
            setForm({ name: '', email: '', category: '', experience: '', availability: '' });
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container page page-enter">
            <div className="volunteers-hero">
                <div className="volunteers-hero__content">
                    <span className="eyebrow"><HandHeart size={14} /> Give back</span>
                    <h1>Volunteers</h1>
                    <p className="page-desc">
                        Lend your skills to education, healthcare, and community initiatives — every hour counts.
                    </p>
                    <Button icon={UserPlus} size="lg" onClick={() => setShowForm(true)}>
                        Register as a volunteer
                    </Button>
                </div>
                <div className="volunteers-hero__art" aria-hidden="true">
                    <HandHeart size={72} strokeWidth={1.2} />
                </div>
            </div>

            <div className="toolbar">
                <div className="chip-row" role="group" aria-label="Filter volunteers by category">
                    <button
                        type="button"
                        className={`chip ${category === '' ? 'chip--active' : ''}`}
                        onClick={() => setCategory('')}
                    >
                        All
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`chip ${category === cat ? 'chip--active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <select
                    className="select select--inline"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort volunteers"
                >
                    <option value="createdAt">Newest first</option>
                    <option value="name">A–Z</option>
                </select>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="card-grid">
                    <SkeletonGrid count={4} lines={4} />
                </div>
            ) : volunteers.length === 0 ? (
                <EmptyState
                    icon={SearchX}
                    title="No volunteers found"
                    description={category ? `No one registered under ${category} yet.` : 'Be the first to volunteer for the community.'}
                    action={<Button icon={UserPlus} onClick={() => setShowForm(true)}>Register as a volunteer</Button>}
                />
            ) : (
                <div className="volunteers-sections">
                    {Object.entries(grouped).map(([cat, list]) => (
                        <section key={cat} className="volunteers-section">
                            <h2 className="volunteers-section__title">
                                {cat}
                                <span>{list.length}</span>
                            </h2>
                            <div className="card-grid">
                                {list.map((volunteer, i) => (
                                    <Reveal key={volunteer._id} delay={Math.min(i * 55, 300)}>
                                        <article className="volunteer-card">
                                            <div className="volunteer-card__head">
                                                <Avatar name={volunteer.name} size={46} />
                                                <div>
                                                    <h3>{volunteer.name}</h3>
                                                    <span className="volunteer-card__since">
                                                        Joined {formatDate(volunteer.createdAt || volunteer.registrationDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            {volunteer.experience && (
                                                <p className="volunteer-card__experience">
                                                    <Award size={14} /> {volunteer.experience}
                                                </p>
                                            )}
                                            <div className="volunteer-card__foot">
                                                <span className="volunteer-card__avail">
                                                    <Clock3 size={14} /> {volunteer.availability}
                                                </span>
                                                <a
                                                    className="volunteer-card__mail"
                                                    href={`mailto:${volunteer.email}`}
                                                    aria-label={`Email ${volunteer.name}`}
                                                >
                                                    <Mail size={15} />
                                                </a>
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Register as a volunteer"
                subtitle="One registration per person — we'll match you with opportunities."
            >
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field__label" htmlFor="vl-name">Full name</label>
                        <input
                            id="vl-name"
                            className="input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Priya Sharma"
                            maxLength={80}
                            required
                            minLength={2}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="vl-email">Email</label>
                        <input
                            id="vl-email"
                            type="email"
                            className="input"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            maxLength={254}
                            required
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="vl-cat">Category</label>
                        <select
                            id="vl-cat"
                            className="select"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="vl-exp">
                            Previous experience <span className="field__hint">(optional)</span>
                        </label>
                        <textarea
                            id="vl-exp"
                            className="textarea"
                            name="experience"
                            value={form.experience}
                            onChange={handleChange}
                            placeholder="Tell organisers a little about your background…"
                            maxLength={500}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="vl-avail">Availability</label>
                        <input
                            id="vl-avail"
                            className="input"
                            name="availability"
                            value={form.availability}
                            onChange={handleChange}
                            placeholder="e.g. weekends, weekday evenings"
                            maxLength={200}
                            required
                        />
                    </div>
                    <div className="events-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting} icon={HandHeart}>Join the team</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Volunteers;
