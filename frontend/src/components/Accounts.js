import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Accounts.css';

const Accounts = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = () => {
        if (!email || !password) {
            setMessage('All fields are required');
            return;
        }
        if (!isValidEmail(email)) {
            setMessage('Invalid email address');
            return;
        }
        axios.post(`${process.env.REACT_APP_PORT_URL}/accounts/login`, { email, password })
            .then(response => {
                const userData = response.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setMessage('Login successful');
                setEmail('');
                setPassword('');
                setTimeout(() => setMessage(''), 1000);
            })
            .catch(error => {
                setMessage('Invalid email or password entered');
                setEmail('');
                setPassword('');
                console.error('Login error:', error);
            });
    };

    const handleSignUp = () => {
        if (!name || !email || !password || !confirmPassword) {
            setMessage('All fields are required');
            return;
        }
        if (!isValidEmail(email)) {
            setMessage('Invalid email address');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        axios.post(`${process.env.REACT_APP_PORT_URL}/accounts/signup`, { name, email, password })
            .then(() => {
                setIsLogin(true);
                setMessage('Sign up successful');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => setMessage(''), 1000);
            })
            .catch(error => {
                setMessage('Email address already registered');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                console.error('Signup error:', error);
            });
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const handleEdit = () => {
        setIsEditing(true);
        setName(user.name);
    };

    const handleSave = () => {
        if (!name || !password) {
            setMessage('All fields are required');
            return;
        }
        if (password && password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
    
        const updatedData = { 
            name, 
            password, 
            token: user.token 
        };
    
        axios.post(`${process.env.REACT_APP_PORT_URL}/accounts/update`, updatedData)
            .then(response => {
                setUser({ ...user, name: response.data.name });
                setIsEditing(false);
                setMessage('Profile updated');
                setTimeout(() => setMessage(''), 1000);
            })
            .catch(error => {
                setMessage('Update failed');
                console.error('Update error:', error);
            });
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="accounts-container">
            {message && <div className={message.includes('failed') ? 'error-message' : 'success-message'}>{message}</div>}
            {user ? (
                isEditing ? (
                    <div className="form-container">
                        <h2>Edit Profile</h2>
                        <br></br>
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        <label>New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <br></br>
                        <div className="button-container">
                            <button onClick={handleCancel} className="cancel-button">Cancel</button>
                            <button onClick={handleSave}>Save</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="logout-container">
                            <button onClick={handleLogout} className="logout-button"><b>Logout</b></button>
                        </div>
                        <h1>My Account</h1>
                        <br></br>
                        <p><strong>Name</strong> {user.name}</p>
                        <p><strong>Email</strong> {user.email}</p>
                        <br></br>
                        <button onClick={handleEdit} className="edit-profile-button">Edit Profile</button>
                    </div>
                )
            ) : isLogin ? (
                <div className="form-container">
                    <h1>Login</h1>
                    <br></br>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}>Login</button>
                    <p>New user? <button className="link-button" onClick={() => setIsLogin(false)}>Sign Up</button></p>
                </div>
            ) : (
                <div className="form-container">
                    <h1>Sign Up</h1>
                    <br></br>
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button onClick={handleSignUp}>Sign Up</button>
                    <p>Already a user? <button className="link-button" onClick={() => setIsLogin(true)}>Login</button></p>
                </div>
            )}
        </div>
    );
};

export default Accounts;
