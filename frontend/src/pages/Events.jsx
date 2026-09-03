import React, { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays, MapPin, Users, Plus, Check, Search,
} from 'lucide-react';
import { fetchEvents, createEvent, rsvpEvent } from '../api/services';
import { useToast } from '../context/ToastContext';
import { hasInteracted, markInteracted } from '../utils/interactions';
import { dateParts, numberFormat } from '../utils/format';
import { CategoryBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonGrid, ErrorState } from '../components/ui/States';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rsvpBusy, setRsvpBusy] = useState(null);
    const toast = useToast();

    const [form, setForm] = useState({
        content: '', description: '', location: '', date: '', category: 'Community',
    });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setEvents(await fetchEvents(sortBy, order));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, order]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return events;
        return events.filter(
            (ev) => ev.content?.toLowerCase().includes(q) || ev.location?.toLowerCase().includes(q)
        );
    }, [events, query]);

    const handleRsvp = async (event) => {
        if (hasInteracted('rsvp', event._id)) return;
        setRsvpBusy(event._id);
        try {
            await rsvpEvent(event._id);
            markInteracted('rsvp', event._id);
            toast.success(`You're going to "${event.content}"!`);
            setEvents((prev) =>
                prev.map((ev) => (ev._id === event._id ? { ...ev, attendees: ev.attendees + 1 } : ev))
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setRsvpBusy(null);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createEvent(form);
            setShowForm(false);
            setForm({ content: '', description: '', location: '', date: '', category: 'Community' });
            toast.success('Event published');
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
                    <span className="eyebrow"><CalendarDays size={14} /> What&apos;s on</span>
                    <h1>Community Events</h1>
                    <p className="page-desc">Town halls, cleanups, and gatherings — RSVP and meet your neighbours.</p>
                </div>
                <Button icon={Plus} onClick={() => setShowForm(true)}>Create event</Button>
            </div>

            <div className="toolbar">
                <div className="events-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search events or locations…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search events"
                    />
                </div>
                <div className="toolbar__group">
                    <select className="select select--inline" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort events by">
                        <option value="createdAt">Newest</option>
                        <option value="date">Event date</option>
                        <option value="content">A–Z</option>
                        <option value="attendees">Most attending</option>
                    </select>
                    <select className="select select--inline" value={order} onChange={(e) => setOrder(e.target.value)} aria-label="Sort direction">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="card-grid">
                    <SkeletonGrid count={4} lines={4} />
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title={query ? 'No events match your search' : 'No events scheduled yet'}
                    description={query ? 'Try a different keyword or clear the search.' : 'Organize the first community gathering!'}
                    action={!query && <Button icon={Plus} onClick={() => setShowForm(true)}>Create the first event</Button>}
                />
            ) : (
                <div className="card-grid">
                    {visible.map((event, i) => {
                        const parts = dateParts(event.date || event.createdAt);
                        const going = hasInteracted('rsvp', event._id);
                        return (
                            <Reveal key={event._id} delay={Math.min(i * 60, 300)}>
                                <article className="event-card">
                                    <div className="event-card__top">
                                        <div className="event-date">
                                            <span className="event-date__day">{parts ? parts.day : '—'}</span>
                                            <span className="event-date__month">{parts ? parts.month : ''}</span>
                                        </div>
                                        <CategoryBadge category={event.category || 'Community'} />
                                    </div>

                                    <h3 className="event-card__title">{event.content}</h3>
                                    {event.description && (
                                        <p className="event-card__desc">{event.description}</p>
                                    )}

                                    <div className="event-card__meta">
                                        {event.location && (
                                            <span><MapPin size={15} /> {event.location}</span>
                                        )}
                                        <span><Users size={15} /> {numberFormat(event.attendees)} attending</span>
                                    </div>

                                    <Button
                                        variant={going ? 'outline' : 'primary'}
                                        icon={going ? Check : null}
                                        disabled={going}
                                        loading={rsvpBusy === event._id}
                                        onClick={() => handleRsvp(event)}
                                        className="event-card__rsvp"
                                    >
                                        {going ? 'You are going' : 'RSVP'}
                                    </Button>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            )}

            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Create an event"
                subtitle="Community events are visible to everyone on the platform."
            >
                <form onSubmit={handleCreate}>
                    <div className="field">
                        <label className="field__label" htmlFor="ev-title">Event title</label>
                        <input
                            id="ev-title"
                            className="input"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="e.g. Riverside Cleanup Morning"
                            maxLength={120}
                            required
                            minLength={3}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="ev-desc">Description</label>
                        <textarea
                            id="ev-desc"
                            className="textarea"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="What should attendees expect?"
                            maxLength={1000}
                        />
                    </div>
                    <div className="events-form-row">
                        <div className="field">
                            <label className="field__label" htmlFor="ev-date">Date</label>
                            <input
                                id="ev-date"
                                type="datetime-local"
                                className="input"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="ev-cat">Category</label>
                            <select
                                id="ev-cat"
                                className="select"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {['Community', 'Governance', 'Environment', 'Health', 'Education'].map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="ev-loc">Location</label>
                        <input
                            id="ev-loc"
                            className="input"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="e.g. Riverfront Park, Gate 3"
                            maxLength={200}
                        />
                    </div>
                    <div className="events-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Publish event</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Events;
