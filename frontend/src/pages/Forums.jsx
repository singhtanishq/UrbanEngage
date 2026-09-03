import React, { useEffect, useMemo, useState } from 'react';
import {
    MessagesSquare, Plus, MessageCircle, Send, Search, Users2, ChevronRight,
} from 'lucide-react';
import { fetchForums, createThread, replyToThread } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRelative } from '../utils/format';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonCard, ErrorState } from '../components/ui/States';
import './Forums.css';

const extractThreads = (forums) => {
    if (!Array.isArray(forums)) return [];
    // Legacy threads predate per-thread timestamps — fall back to the parent
    // forum document's creation date.
    return forums.flatMap((forum) =>
        (forum.threads || []).map((thread) => ({
            ...thread,
            forumId: forum._id,
            createdAt: thread.postedAt || forum.createdAt,
        }))
    );
};

const Forums = () => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [activeThread, setActiveThread] = useState(null);
    const [query, setQuery] = useState('');

    const [form, setForm] = useState({ title: '', author: '', content: '' });
    const [reply, setReply] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, isLoggedIn } = useAuth();
    const toast = useToast();

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchForums();
            setThreads(extractThreads(data));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const visibleThreads = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return threads;
        return threads.filter(
            (t) => t.title?.toLowerCase().includes(q) || t.posts?.some((p) => p.content?.toLowerCase().includes(q))
        );
    }, [threads, query]);

    const openForm = () => {
        setForm({ title: '', author: isLoggedIn ? user.name : '', content: '' });
        setShowForm(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createThread(form);
            setShowForm(false);
            toast.success('Thread posted to the community');
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !activeThread) return;
        const author = isLoggedIn ? user.name : 'Anonymous';
        try {
            await replyToThread(activeThread._id, { author, content: reply.trim() });
            toast.success('Reply posted');
            setReply('');
            const fresh = await fetchForums();
            const updated = extractThreads(fresh).find((t) => t._id === activeThread._id);
            if (updated) setActiveThread(updated);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="container page page-enter">
            <div className="toolbar">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <span className="eyebrow"><Users2 size={14} /> Discussions</span>
                    <h1>Community Forums</h1>
                    <p className="page-desc">Ideas, questions, and neighbourhood news — discussed in the open.</p>
                </div>
                <Button icon={Plus} onClick={openForm}>New thread</Button>
            </div>

            <div className="forums-controls">
                <div className="forums-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search threads…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search threads"
                    />
                </div>
                <span className="forums-count">
                    {visibleThreads.length} thread{visibleThreads.length === 1 ? '' : 's'}
                </span>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="forums-list">
                    <SkeletonCard lines={3} />
                    <SkeletonCard lines={3} />
                    <SkeletonCard lines={3} />
                </div>
            ) : visibleThreads.length === 0 ? (
                <EmptyState
                    icon={MessagesSquare}
                    title={query ? 'No threads match your search' : 'No discussions yet'}
                    description={query ? 'Try a different keyword.' : 'Be the first to start a conversation.'}
                    action={!query && <Button icon={Plus} onClick={openForm}>Start the first thread</Button>}
                />
            ) : (
                <div className="forums-list">
                    {visibleThreads.map((thread, i) => (
                        <Reveal key={thread._id} delay={Math.min(i * 55, 330)}>
                            <button
                                type="button"
                                className="thread-card"
                                onClick={() => setActiveThread(thread)}
                            >
                                <div className="thread-card__main">
                                    <h3>{thread.title}</h3>
                                    <div className="thread-card__meta">
                                        <Avatar name={thread.posts?.[0]?.author} size={24} />
                                        <span>{thread.posts?.[0]?.author || 'Anonymous'}</span>
                                        <span className="dot">·</span>
                                        <span>{formatRelative(thread.createdAt)}</span>
                                    </div>
                                    <p className="thread-card__excerpt">
                                        {thread.posts?.[0]?.content?.slice(0, 160)}
                                        {(thread.posts?.[0]?.content?.length || 0) > 160 ? '…' : ''}
                                    </p>
                                </div>
                                <div className="thread-card__side">
                                    <span className="thread-card__replies">
                                        <MessageCircle size={16} />
                                        {thread.posts?.length || 0}
                                    </span>
                                    <ChevronRight size={18} className="thread-card__chevron" />
                                </div>
                            </button>
                        </Reveal>
                    ))}
                </div>
            )}

            {/* ----- New thread modal ----- */}
            <Modal
                open={showForm}
                onClose={() => setShowForm(false)}
                title="Start a new thread"
                subtitle="Good titles get better replies."
            >
                <form onSubmit={handleCreate}>
                    <div className="field">
                        <label className="field__label" htmlFor="th-title">Title</label>
                        <input
                            id="th-title"
                            className="input"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Ideas for the old railway yard?"
                            maxLength={150}
                            required
                            minLength={3}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="th-author">Your name</label>
                        <input
                            id="th-author"
                            className="input"
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            placeholder={isLoggedIn ? '' : 'e.g. Alex Morgan (or sign in)'}
                            maxLength={80}
                            required
                            minLength={2}
                            readOnly={isLoggedIn}
                        />
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="th-content">Your post</label>
                        <textarea
                            id="th-content"
                            className="textarea"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Share the details…"
                            maxLength={2000}
                            required
                            minLength={3}
                        />
                    </div>
                    <div className="forums-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Post thread</Button>
                    </div>
                </form>
            </Modal>

            {/* ----- Thread drawer ----- */}
            <Modal
                wide
                open={activeThread !== null}
                onClose={() => setActiveThread(null)}
                title={activeThread?.title || ''}
                subtitle={activeThread ? `${activeThread.posts?.length || 0} post${(activeThread.posts?.length || 0) === 1 ? '' : 's'} · started ${formatRelative(activeThread.createdAt)}` : ''}
                bodyClassName="forums-thread-body"
            >
                <div className="post-list">
                    {activeThread?.posts?.map((post, i) => (
                        <div key={i} className="post" style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                            <Avatar name={post.author} size={34} />
                            <div className="post__bubble">
                                <div className="post__head">
                                    <strong>{post.author}</strong>
                                    <span>#{i + 1}</span>
                                </div>
                                <p>{post.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="reply-form" onSubmit={handleReply}>
                    <Avatar name={isLoggedIn ? user.name : 'A'} size={34} />
                    <input
                        className="input reply-form__input"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={isLoggedIn ? `Reply as ${user.name}…` : 'Reply as Anonymous — or sign in…'}
                        maxLength={2000}
                        required
                    />
                    <button type="submit" className="reply-form__send" aria-label="Send reply" disabled={!reply.trim()}>
                        <Send size={17} />
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Forums;
