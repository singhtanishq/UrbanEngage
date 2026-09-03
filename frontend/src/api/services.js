import { api } from './client';

/* Accounts */
export const loginRequest = (email, password) => api.post('/accounts/login', { email, password });
export const signupRequest = (name, email, password) => api.post('/accounts/signup', { name, email, password });
export const updateProfileRequest = (name, password) => api.post('/accounts/update', { name, password }, { auth: true });
export const fetchMe = () => api.get('/accounts/me', { auth: true });

/* Dashboard */
export const fetchDashboardStats = () => api.get('/dashboard/stats');

/* Forums */
export const fetchForums = () => api.get('/forums');
export const createThread = (payload) => api.post('/forums/add', payload);
export const replyToThread = (threadId, payload) => api.post(`/forums/threads/${threadId}/reply`, payload);

/* Events */
export const fetchEvents = (sortBy, order) => api.get(`/events?sortBy=${sortBy}&order=${order}`);
export const createEvent = (payload) => api.post('/events/add', payload);
export const rsvpEvent = (id) => api.post(`/events/rsvp/${id}`);

/* Issues */
export const fetchIssues = (sortBy, order, category) => {
    const params = new URLSearchParams({ sortBy, order });
    if (category && category !== 'All') params.set('category', category);
    return api.get(`/issues?${params.toString()}`);
};
export const createIssue = (payload) => api.post('/issues/add', payload);
export const upvoteIssue = (id) => api.post(`/issues/upvote/${id}`);
export const commentOnIssue = (id, payload) => api.post(`/issues/comment/${id}`, payload);
export const setIssueStatus = (id, status) => api.post(`/issues/status/${id}`, { status });

/* Petitions */
export const fetchPetitions = (sortBy, order) => api.get(`/petitions?sortBy=${sortBy}&order=${order}`);
export const createPetition = (payload) => api.post('/petitions/add', payload);
export const signPetition = (id) => api.post(`/petitions/sign/${id}`);

/* Polls */
export const fetchPolls = () => api.get('/polls');
export const createPoll = (payload) => api.post('/polls/add', payload);
export const votePoll = (id, optionIndex) => api.post(`/polls/vote/${id}`, { optionIndex });

/* Volunteers */
export const fetchVolunteers = (sortBy, order, category) => {
    const params = new URLSearchParams({ sortBy, order });
    if (category) params.set('category', category);
    return api.get(`/volunteers?${params.toString()}`);
};
export const registerVolunteer = (payload) => api.post('/volunteers/add', payload);
