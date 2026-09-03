import React, { useEffect, useMemo, useState } from 'react';
import {
    Flag, Plus, ChevronUp, MessageCircle, Send, Search, Clock,
} from 'lucide-react';
import { fetchIssues, createIssue, upvoteIssue, commentOnIssue, setIssueStatus } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hasInteracted, markInteracted } from '../utils/interactions';
import { formatRelative, numberFormat } from '../utils/format';
import { CategoryBadge, StatusBadge } from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Reveal from '../components/ui/Reveal';
import { EmptyState, SkeletonGrid, ErrorState } from '../components/ui/States';
import './Issues.css';

const CATEGORIES = ['All', 'General', 'Infrastructure', 'Safety', 'Environment'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('createdAt');
    const [query, setQuery] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ content: '', category: 'General' });

    const [openComments, setOpenComments] = useState({});
    const [commentText, setCommentText] = useState({});
    const [commentBusy, setCommentBusy] = useState(null);
    const [upvoteBusy, setUpvoteBusy] = useState(null);

    const { user, isLoggedIn } = useAuth();
    const toast = useToast();

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setIssues(await fetchIssues(sortBy, 'desc', category));
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

    const visible = useMemo(() => {
        let list = issues;
        if (statusFilter !== 'All') list = list.filter((issue) => issue.status === statusFilter);
        const q = query.trim().toLowerCase();
        if (q) list = list.filter((issue) => issue.content?.toLowerCase().includes(q));
        return list;
    }, [issues, statusFilter, query]);

    const handleReport = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createIssue({ ...form, author: isLoggedIn ? user.name : undefined });
            setShowForm(false);
            setForm({ content: '', category: 'General' });
            toast.success('Issue reported — thank you for looking out!');
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (issue) => {
        if (hasInteracted('upvote', issue._id)) return;
        setUpvoteBusy(issue._id);
        try {
            await upvoteIssue(issue._id);
            markInteracted('upvote', issue._id);
            setIssues((prev) =>
                prev.map((it) => (it._id === issue._id ? { ...it, upvotes: it.upvotes + 1 } : it))
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUpvoteBusy(null);
        }
    };

    const handleComment = async (issue) => {
        const content = (commentText[issue._id] || '').trim();
        if (!content) return;
        setCommentBusy(issue._id);
        try {
            const res = await commentOnIssue(issue._id, {
                content,
                author: isLoggedIn ? user.name : 'Anonymous',
            });
            setIssues((prev) =>
                prev.map((it) => (it._id === issue._id ? { ...it, comments: res.comments } : it))
            );
            setCommentText((prev) => ({ ...prev, [issue._id]: '' }));
            toast.success('Comment added');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCommentBusy(null);
        }
    };

    const handleStatus = async (issue, status) => {
        try {
            await setIssueStatus(issue._id, status);
            setIssues((prev) =>
                prev.map((it) => (it._id === issue._id ? { ...it, status } : it))
            );
            toast.success(`Marked as ${status}`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleComments = (id) =>
        setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="container page page-enter">
            <div className="toolbar">
                <div className="page-head" style={{ marginBottom: 0 }}>
                    <span className="eyebrow"><Flag size={14} /> Civic tracking</span>
                    <h1>Reported Issues</h1>
                    <p className="page-desc">Report local problems, upvote what matters, and follow fixes from open to resolved.</p>
                </div>
                <Button icon={Plus} onClick={() => {
                    setForm({ content: '', category: 'General' });
                    setShowForm(true);
                }}>Report issue</Button>
            </div>

            <div className="issues-filters">
                <div className="chip-row" role="group" aria-label="Filter by category">
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
                <div className="issues-filters__right">
                    <div className="issues-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search issues…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search issues"
                        />
                    </div>
                    <select
                        className="select select--inline"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="All">All statuses</option>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        className="select select--inline"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort issues"
                    >
                        <option value="createdAt">Newest</option>
                        <option value="upvotes">Most upvoted</option>
                        <option value="content">A–Z</option>
                    </select>
                </div>
            </div>

            {error ? (
                <ErrorState message={error} onRetry={load} />
            ) : loading ? (
                <div className="issues-grid">
                    <SkeletonGrid count={6} lines={4} />
                </div>
            ) : visible.length === 0 ? (
                <EmptyState
                    icon={Flag}
                    title={query || category !== 'All' || statusFilter !== 'All' ? 'No issues match these filters' : 'No issues reported yet'}
                    description={
                        query || category !== 'All' || statusFilter !== 'All'
                            ? 'Try clearing the filters or searching for something else.'
                            : 'The streets are suspiciously perfect. Report the first issue!'
                    }
                    action={!query && category === 'All' && statusFilter === 'All' && (
                        <Button icon={Plus} onClick={() => setShowForm(true)}>Report the first issue</Button>
                    )}
                />
            ) : (
                <div className="issues-grid">
                    {visible.map((issue, i) => {
                        const upvoted = hasInteracted('upvote', issue._id);
                        const commentsOpen = openComments[issue._id];
                        const comments = issue.comments || [];
                        return (
                            <Reveal key={issue._id} delay={Math.min(i * 55, 330)}>
                                <article className="issue-card">
                                    <div className="issue-card__top">
                                        <div className="issue-card__tags">
                                            <CategoryBadge category={issue.category} />
                                            <StatusBadge status={issue.status} />
                                        </div>
                                        <span className="issue-card__time"><Clock size={13} /> {formatRelative(issue.createdAt)}</span>
                                    </div>

                                    <p className="issue-card__content">{issue.content}</p>

                                    <div className="issue-card__byline">
                                        <Avatar name={issue.author || 'Anonymous'} size={22} />
                                        <span>{issue.author || 'Anonymous'}</span>
                                    </div>

                                    <div className="issue-card__actions">
                                        <button
                                            type="button"
                                            className={`vote-btn ${upvoted ? 'vote-btn--active' : ''}`}
                                            onClick={() => handleUpvote(issue)}
                                            disabled={upvoted || upvoteBusy === issue._id}
                                            aria-label={`Upvote issue (${issue.upvotes} upvotes)`}
                                        >
                                            <ChevronUp size={16} />
                                            <span>{numberFormat(issue.upvotes)}</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`comment-toggle ${commentsOpen ? 'comment-toggle--open' : ''}`}
                                            onClick={() => toggleComments(issue._id)}
                                            aria-expanded={commentsOpen}
                                        >
                                            <MessageCircle size={15} />
                                            {comments.length} comment{comments.length === 1 ? '' : 's'}
                                        </button>

                                        <select
                                            className="select select--inline issue-status-select"
                                            value={issue.status || 'Open'}
                                            onChange={(e) => handleStatus(issue, e.target.value)}
                                            aria-label="Change issue status"
                                        >
                                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    {commentsOpen && (
                                        <div className="issue-comments">
                                            {comments.length === 0 ? (
                                                <p className="issue-comments__empty">No comments yet — start the conversation.</p>
                                            ) : (
                                                comments.map((comment, idx) => (
                                                    <div key={idx} className="issue-comment">
                                                        <Avatar name={comment.author} size={26} />
                                                        <div className="issue-comment__body">
                                                            <div className="issue-comment__head">
                                                                <strong>{comment.author}</strong>
                                                                <time>{formatRelative(comment.timestamp)}</time>
                                                            </div>
                                                            <p>{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            <div className="issue-comment-form">
                                                <input
                                                    className="input"
                                                    value={commentText[issue._id] || ''}
                                                    onChange={(e) => setCommentText((prev) => ({ ...prev, [issue._id]: e.target.value }))}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(issue)}
                                                    placeholder={isLoggedIn ? `Comment as ${user.name}…` : 'Comment as Anonymous…'}
                                                    maxLength={500}
                                                    aria-label="Write a comment"
                                                />
                                                <button
                                                    type="button"
                                                    className="issue-comment-send"
                                                    onClick={() => handleComment(issue)}
                                                    disabled={commentBusy === issue._id || !(commentText[issue._id] || '').trim()}
                                                    aria-label="Post comment"
                                                >
                                                    <Send size={15} />
                                                </button>
                                            </div>
                                        </div>
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
                title="Report an issue"
                subtitle="Be specific — clear reports get resolved faster."
            >
                <form onSubmit={handleReport}>
                    <div className="field">
                        <label className="field__label" htmlFor="is-cat">Category</label>
                        <select
                            id="is-cat"
                            className="select"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="is-content">What&apos;s the problem?</label>
                        <textarea
                            id="is-content"
                            className="textarea"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="e.g. Street lights out along Riverside Park pathway — unsafe after dusk"
                            maxLength={1000}
                            required
                            minLength={10}
                        />
                        <span className="field__hint">{form.content.length}/1000 characters (minimum 10)</span>
                    </div>
                    <div className="events-form-actions">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting} icon={Flag}>Submit report</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Issues;
