import React, { useEffect, useMemo, useState } from 'react';
import { FileSignature, Plus, PenLine, Users, CalendarClock, Check, Search } from 'lucide-react';
import { fetchPetitions, createPetition, signPetition } from '../api/services';
import { useToast } from '../context/ToastContext';
import { hasInteracted, markInteracted } from '../utils/interactions';
import { formatDate, numberFormat } from '../utils/format';
import { ProgressBar } from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonGrid, ErrorState } from '../components/ui/States';
import './Petitions.css';

const Petitions = () => {
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [signBusy, setSignBusy] = useState(null);
    const toast = useToast();

    const [form, setForm] = useState({ content: '', description: '', goal: 100, deadline: '' });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setPetitions(await fetchPetitions(sortBy, 'desc'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return petitions;
        return petitions.filter(
            (p) => p.content?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );
    }, [petitions, query]);

    const handleSign = async (petition) => {
        if (hasInteracted('sign', petition._id)) return;
        setSignBusy(petition._id);
        try {
            await signPetition(petition._id);
            markInteracted('sign', petition._id);
            setPetitions((prev) =>
                prev.map((p) => (p._id === petition._id ? { ...p, signatures: p.signatures + 1 } : p))
            );
            toast.success(`Signed "${petition.content}"`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSignBusy(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createPetition({
                ...form,
                goal: Number(form.goal) || 100,
                deadline: form.deadline || undefined,
            });
            setShowForm(false);
            setForm({ content: '', description: '', goal: 100, deadline: '' });
            toast.success('Petition created — rally the signatures!');
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container page page-enter">
            <div className="toolbar">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <span className="eyebrow"><FileSignature size={14} /> Collective action</span>
                    <h1>Petitions</h1>
                    <p className="page-desc">Start or back petitions that put community priorities in front of decision-makers.</p>
                </div>
                <Button icon={Plus} onClick={() => setShowForm(true)}>Start a petition</Button>
            </div>

            <div className="toolbar">
                <div className="petitions-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search petitions…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search petitions"
                    />
                </div>
                <select
                    className="select select--inline"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort petitions"
                >
                    <option value="createdAt">Newest</option>
                    <option value="signatures">Most signed</option>
                    <option value="content">A–Z</option>
                </select>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="card-grid">
                    <SkeletonGrid count={6} lines={4} />
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={FileSignature}
                    title={query ? 'No petitions match your search' : 'No petitions yet'}
                    description={query ? 'Try different keywords.' : 'What should change in your city? Start the first petition.'}
                    action={!query && <Button icon={Plus} onClick={() => setShowForm(true)}>Start a petition</Button>}
                />
            ) : (
                <div className="card-grid">
                    {visible.map((petition, i) => {
                        const goal = petition.goal || 100;
                        const signed = hasInteracted('sign', petition._id);
                        const pct = Math.min(100, Math.round(((petition.signatures || 0) / goal) * 100));
                        return (
                            <Reveal key={petition._id} delay={Math.min(i * 60, 300)}>
                                <article className={`petition-card ${signed ? 'petition-card--signed' : ''}`}>
                                    <div className="petition-card__badges">
                                        <span className="petition-pct" aria-hidden="true">{pct}%</span>
                                        {petition.deadline && (
                                            <span className="petition-deadline">
                                                <CalendarClock size={13} /> {formatDate(petition.deadline)}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="petition-card__title">{petition.content}</h3>
                                    {petition.description && (
                                        <p className="petition-card__desc">{petition.description}</p>
                                    )}

                                    <div className="petition-card__progress">
                                        <ProgressBar value={petition.signatures || 0} max={goal} />
                                        <div className="petition-card__progress-meta">
                                            <span>
                                                <strong>{numberFormat(petition.signatures)}</strong> of {numberFormat(goal)} signatures
                                            </span>
                                            <span className="petition-card__signers">
                                                <Users size={13} /> {pct === 100 ? 'Goal reached!' : `${numberFormat(Math.max(0, goal - (petition.signatures || 0)))} to go`}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant={signed ? 'outline' : 'primary'}
                                        icon={signed ? Check : PenLine}
                                        disabled={signed}
                                        loading={signBusy === petition._id}
                                        onClick={() => handleSign(petition)}
                                        className="petition-card__sign"
                                    >
                                        {signed ? 'Signed — thank you!' : 'Sign petition'}
                                    </Button>

                                    <span className="petition-card__date">Started {formatDate(petition.createdAt)}</span>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            )}

            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Start a petition"
                subtitle="A clear ask with a realistic goal gets more signatures."
            >
                <form onSubmit={handleCreate}>
                    <div className="field">
                        <label className="field__label" htmlFor="pt-title">Petition title</label>
                        <input
                            id="pt-title"
                            className="input"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="e.g. Better Public Transport on Route 12"
                            maxLength={150}
                            required
                            minLength={5}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="pt-desc">Details</label>
                        <textarea
                            id="pt-desc"
                            className="textarea"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Explain the change you're asking for and why it matters."
                            maxLength={2000}
                        />
                    </div>
                    <div className="events-form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="pt-goal">Signature goal</label>
                            <input
                                id="pt-goal"
                                type="number"
                                min="1"
                                max="1000000"
                                className="input"
                                value={form.goal}
                                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="pt-deadline">Deadline (optional)</label>
                            <input
                                id="pt-deadline"
                                type="date"
                                className="input"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="events-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Create petition</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Petitions;
