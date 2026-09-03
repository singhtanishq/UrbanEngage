import React, { useEffect, useState } from 'react';
import { Vote, Plus, BarChart3, Check, X, PieChart } from 'lucide-react';
import { fetchPolls, createPoll, votePoll } from '../api/services';
import { useToast } from '../context/ToastContext';
import { getInteraction, hasInteracted, markInteracted } from '../utils/interactions';
import { CategoryBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonCard, ErrorState } from '../components/ui/States';
import './Polls.css';

const Polls = () => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [voteBusy, setVoteBusy] = useState(null);
    const toast = useToast();

    const [form, setForm] = useState({ description: '', category: 'General', options: ['', ''] });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setPolls(await fetchPolls());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createPoll(form);
            setShowForm(false);
            setForm({ description: '', category: 'General', options: ['', ''] });
            toast.success('Poll created — let the voting begin!');
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (poll, optionIndex) => {
        if (hasInteracted('vote', poll._id)) return;
        setVoteBusy(`${poll._id}-${optionIndex}`);
        try {
            await votePoll(poll._id, optionIndex);
            markInteracted('vote', poll._id, optionIndex);
            setPolls((prev) =>
                prev.map((p) => {
                    if (p._id !== poll._id) return p;
                    const votes = [...(p.votes || [])];
                    votes[optionIndex] = (votes[optionIndex] || 0) + 1;
                    return { ...p, votes };
                })
            );
            toast.success('Vote counted — results are live!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setVoteBusy(null);
        }
    };

    const setOption = (index, value) => {
        const options = [...form.options];
        options[index] = value;
        setForm({ ...form, options });
    };

    const addOption = () => {
        if (form.options.length < 5) setForm({ ...form, options: [...form.options, ''] });
    };

    const removeOption = (index) => {
        if (form.options.length <= 2) return;
        setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
    };

    return (
        <div className="container page page-enter">
            <div className="toolbar">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <span className="eyebrow"><PieChart size={14} /> Participatory decisions</span>
                    <h1>Community Polls</h1>
                    <p className="page-desc">Quick votes on the topics that shape the neighbourhood — results update in real time.</p>
                </div>
                <Button icon={Plus} onClick={() => setShowForm(true)}>Create poll</Button>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="polls-list">
                    <SkeletonCard lines={4} />
                    <SkeletonCard lines={4} />
                </div>
            ) : polls.length === 0 ? (
                <EmptyState
                    icon={Vote}
                    title="No polls yet"
                    description="Ask the community a question and watch opinions roll in."
                    action={<Button icon={Plus} onClick={() => setShowForm(true)}>Create the first poll</Button>}
                />
            ) : (
                <div className="polls-list">
                    {polls.map((poll, i) => {
                        const votes = Array.isArray(poll.votes) ? poll.votes : [];
                        const total = votes.reduce((sum, v) => sum + (v || 0), 0);
                        const choice = getInteraction('vote', poll._id);
                        const voted = choice !== false;
                        return (
                            <Reveal key={poll._id} delay={Math.min(i * 70, 350)}>
                                <article className="poll-card">
                                    <div className="poll-card__head">
                                        <div>
                                            <h3>{poll.description}</h3>
                                            <span className="poll-card__meta">
                                                <BarChart3 size={14} /> {total} vote{total === 1 ? '' : 's'} cast
                                            </span>
                                        </div>
                                        <CategoryBadge category={poll.category} />
                                    </div>

                                    <div className="poll-card__options">
                                        {(poll.options || []).map((option, idx) => {
                                            const count = votes[idx] || 0;
                                            const pct = total > 0 ? (count / total) * 100 : 0;
                                            const isChoice = voted && choice === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`poll-option ${voted ? 'poll-option--done' : ''} ${isChoice ? 'poll-option--choice' : ''}`}
                                                    onClick={() => handleVote(poll, idx)}
                                                    disabled={voted || voteBusy === `${poll._id}-${idx}`}
                                                    aria-label={`Vote for ${option}`}
                                                >
                                                    <span className="poll-option__bar" style={{ width: `${pct}%` }} />
                                                    <span className="poll-option__row">
                                                        <span className="poll-option__label">
                                                            {isChoice && <Check size={14} />}
                                                            {option}
                                                        </span>
                                                        <span className="poll-option__stats">
                                                            {pct.toFixed(0)}% · {count}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {!voted && (
                                        <p className="poll-card__hint">Click an option to vote — results appear instantly.</p>
                                    )}
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            )}

            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Create a poll"
                subtitle="Keep questions short so options stay comparable."
            >
                <form onSubmit={handleCreate}>
                    <div className="field">
                        <label className="field__label" htmlFor="pl-desc">Question</label>
                        <textarea
                            id="pl-desc"
                            className="textarea"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g. What should the vacant lot on 5th Street become?"
                            maxLength={300}
                            required
                            minLength={5}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="pl-cat">Category</label>
                        <select
                            id="pl-cat"
                            className="select"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {['General', 'Technology', 'Health', 'Education'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label">Options (2–5)</label>
                        {form.options.map((option, index) => (
                            <div key={index} className="polls-option-row">
                                <input
                                    className="input"
                                    value={option}
                                    onChange={(e) => setOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    maxLength={100}
                                    required
                                />
                                {form.options.length > 2 && (
                                    <button
                                        type="button"
                                        className="polls-option-remove"
                                        onClick={() => removeOption(index)}
                                        aria-label={`Remove option ${index + 1}`}
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {form.options.length < 5 && (
                            <button type="button" className="btn btn--ghost btn--sm" onClick={addOption} style={{ alignSelf: 'flex-start' }}>
                                <Plus size={15} /> Add option
                            </button>
                        )}
                    </div>

                    <div className="events-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting} icon={Vote}>Create poll</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Polls;
