import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Landmark, Mail, Lock, User, Eye, EyeOff, LogOut, Pencil,
    ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initials, avatarGradient } from '../utils/format';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import './Accounts.css';

const passwordScore = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (pw.length >= 12) score += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    return Math.min(score, 4);
};

const SCORE_LABELS = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];

const Accounts = () => {
    const { user, isLoggedIn, login, signup, updateProfile, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [busy, setBusy] = useState(false);

    // login / signup fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // profile edit state
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editConfirm, setEditConfirm] = useState('');

    const score = useMemo(() => passwordScore(editing ? editPassword : password), [editing, editPassword, password]);

    const switchMode = (next) => {
        setMode(next);
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const data = await login(email.trim(), password);
            toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setBusy(true);
        try {
            await signup(name.trim(), email.trim(), password);
            toast.success('Account created — you can sign in now');
            switchMode('login');
            setEmail(email);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const startEdit = () => {
        setEditName(user.name);
        setEditPassword('');
        setEditConfirm('');
        setEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (editPassword && editPassword !== editConfirm) {
            toast.error('Passwords do not match');
            return;
        }
        if (editPassword && editPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setBusy(true);
        try {
            await updateProfile(editName.trim(), editPassword || undefined);
            toast.success('Profile updated');
            setEditing(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.info('You have been signed out');
        navigate('/');
    };

    /* ---------------- Signed in: profile ---------------- */
    if (isLoggedIn) {
        return (
            <div className="container page page-enter accounts-page">
                <Reveal className="profile-card">
                    <div className="profile-card__banner" />
                    <div className="profile-card__body">
                        {editing ? (
                            <form onSubmit={handleSave} className="profile-edit">
                                <button type="button" className="profile-back" onClick={() => setEditing(false)}>
                                    <ArrowLeft size={16} /> Back to profile
                                </button>
                                <span
                                    className="profile-avatar profile-avatar--lg"
                                    style={{ background: avatarGradient(editName || user.name) }}
                                    aria-hidden="true"
                                >
                                    {initials(editName || user.name)}
                                </span>
                                <h1>Edit profile</h1>
                                <p className="text-soft">Update your display name or set a new password.</p>

                                <div className="field">
                                    <label className="field__label" htmlFor="pf-name">Display name</label>
                                    <input
                                        id="pf-name"
                                        className="input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        maxLength={80}
                                        required
                                        minLength={2}
                                    />
                                </div>

                                <div className="field">
                                    <label className="field__label" htmlFor="pf-pass">New password <span className="field__hint">(leave blank to keep current)</span></label>
                                    <div className="password-wrap">
                                        <input
                                            id="pf-pass"
                                            type={showPassword ? 'text' : 'password'}
                                            className="input"
                                            value={editPassword}
                                            onChange={(e) => setEditPassword(e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                    {editPassword && (
                                        <div className="strength">
                                            <div className="strength__bars">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <span key={i} className={`strength__bar ${score > i ? `strength__bar--on strength__bar--${score}` : ''}`} />
                                                ))}
                                            </div>
                                            <small>{SCORE_LABELS[score]}</small>
                                        </div>
                                    )}
                                </div>

                                {editPassword && (
                                    <div className="field">
                                        <label className="field__label" htmlFor="pf-confirm">Confirm new password</label>
                                        <input
                                            id="pf-confirm"
                                            type="password"
                                            className="input"
                                            value={editConfirm}
                                            onChange={(e) => setEditConfirm(e.target.value)}
                                            placeholder="Repeat the new password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                )}

                                <div className="profile-edit__actions">
                                    <Button type="submit" loading={busy}>Save changes</Button>
                                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-view">
                                <span
                                    className="profile-avatar profile-avatar--lg"
                                    style={{ background: avatarGradient(user.name) }}
                                    aria-hidden="true"
                                >
                                    {initials(user.name)}
                                </span>
                                <h1>{user.name}</h1>
                                <p className="profile-email"><Mail size={15} /> {user.email}</p>

                                <div className="profile-badges">
                                    <span className="profile-badge"><ShieldCheck size={15} /> Verified session</span>
                                    <span className="profile-badge"><CheckCircle2 size={15} /> Citizen account</span>
                                </div>

                                <div className="profile-actions">
                                    <Button icon={Pencil} onClick={startEdit}>Edit profile</Button>
                                    <Button variant="outline" icon={LogOut} onClick={handleLogout}>Sign out</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Reveal>
            </div>
        );
    }

    /* ---------------- Signed out: auth ---------------- */
    return (
        <div className="container page page-enter accounts-page">
            <Reveal className="auth-shell">
                <aside className="auth-side">
                    <span className="auth-side__logo"><Landmark size={26} /></span>
                    <h2>{mode === 'login' ? 'Welcome back to your city hall.' : 'Join your neighbours.'}</h2>
                    <p>
                        {mode === 'login'
                            ? 'Sign in to report issues, track petitions, and RSVP to community events.'
                            : 'Create a free account to engage with every module of the platform.'}
                    </p>
                    <ul className="auth-side__points">
                        <li><CheckCircle2 size={16} /> Report and track civic issues</li>
                        <li><CheckCircle2 size={16} /> Sign petitions that matter to you</li>
                        <li><CheckCircle2 size={16} /> Vote in community polls</li>
                    </ul>
                </aside>

                <div className="auth-main">
                    {mode === 'login' ? (
                        <form key="login" className="auth-form" onSubmit={handleLogin}>
                            <h1>Sign in</h1>
                            <p className="text-soft">Good to see you again.</p>

                            <div className="field">
                                <label className="field__label" htmlFor="au-email">Email</label>
                                <div className="password-wrap">
                                    <Mail size={17} className="auth-input-icon" />
                                    <input
                                        id="au-email"
                                        type="email"
                                        className="input auth-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="au-pass">Password</label>
                                <div className="password-wrap">
                                    <Lock size={17} className="auth-input-icon" />
                                    <input
                                        id="au-pass"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input auth-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" size="lg" loading={busy} className="auth-submit">Sign in</Button>
                            <p className="auth-switch">
                                New to Urban Engage?{' '}
                                <button type="button" onClick={() => switchMode('signup')}>Create an account</button>
                            </p>
                        </form>
                    ) : (
                        <form key="signup" className="auth-form" onSubmit={handleSignup}>
                            <h1>Create account</h1>
                            <p className="text-soft">Free forever for citizens.</p>

                            <div className="field">
                                <label className="field__label" htmlFor="su-name">Full name</label>
                                <div className="password-wrap">
                                    <User size={17} className="auth-input-icon" />
                                    <input
                                        id="su-name"
                                        className="input auth-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Alex Morgan"
                                        maxLength={80}
                                        required
                                        minLength={2}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="su-email">Email</label>
                                <div className="password-wrap">
                                    <Mail size={17} className="auth-input-icon" />
                                    <input
                                        id="su-email"
                                        type="email"
                                        className="input auth-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="su-pass">Password</label>
                                <div className="password-wrap">
                                    <Lock size={17} className="auth-input-icon" />
                                    <input
                                        id="su-pass"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input auth-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="strength">
                                        <div className="strength__bars">
                                            {[0, 1, 2, 3].map((i) => (
                                                <span key={i} className={`strength__bar ${score > i ? `strength__bar--on strength__bar--${score}` : ''}`} />
                                            ))}
                                        </div>
                                        <small>{SCORE_LABELS[score]}</small>
                                    </div>
                                )}
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="su-confirm">Confirm password</label>
                                <div className="password-wrap">
                                    <Lock size={17} className="auth-input-icon" />
                                    <input
                                        id="su-confirm"
                                        type="password"
                                        className="input auth-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                {confirmPassword && confirmPassword !== password && (
                                    <span className="field__hint auth-mismatch"><AlertCircle size={13} /> Passwords don&apos;t match yet</span>
                                )}
                            </div>

                            <Button type="submit" size="lg" loading={busy} className="auth-submit">Create account</Button>
                            <p className="auth-switch">
                                Already a member?{' '}
                                <button type="button" onClick={() => switchMode('login')}>Sign in</button>
                            </p>
                        </form>
                    )}
                </div>
            </Reveal>
        </div>
    );
};

export default Accounts;
