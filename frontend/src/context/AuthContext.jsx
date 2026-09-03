import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredAuth, storeAuth } from '../api/client';
import { loginRequest, signupRequest, updateProfileRequest } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getStoredAuth());

    useEffect(() => {
        storeAuth(user);
    }, [user]);

    const value = useMemo(() => ({
        user,
        isLoggedIn: Boolean(user?.token),

        async login(email, password) {
            const data = await loginRequest(email, password);
            setUser(data);
            return data;
        },

        async signup(name, email, password) {
            return signupRequest(name, email, password);
        },

        async updateProfile(name, password) {
            const data = await updateProfileRequest(name, password);
            setUser((prev) => ({ ...(prev || {}), name: data.name, email: data.email }));
            return data;
        },

        logout() {
            setUser(null);
        },
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
