/**
 * Per-browser interaction guards so a visitor cannot double-count
 * RSVPs, petition signatures, or poll votes from the same browser.
 * Optionally stores a small detail (e.g. the chosen poll option).
 * (The backend remains open like the rest of the platform.)
 */

const KEY = 'ue_interactions';

const read = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
        return {};
    }
};

const write = (data) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
        /* storage unavailable — degrade gracefully */
    }
};

/**
 * Detail stored for an interaction, `true` when recorded without detail,
 * or `false` when the interaction has not happened.
 */
export const getInteraction = (group, id) => {
    const entry = (read()[group] || {})[id];
    if (entry === undefined) return false;
    return entry?.detail !== undefined ? entry.detail : true;
};

export const hasInteracted = (group, id) => getInteraction(group, id) !== false;

export const markInteracted = (group, id, detail) => {
    const data = read();
    data[group] = data[group] || {};
    data[group][id] = { at: Date.now(), ...(detail !== undefined ? { detail } : {}) };
    write(data);
};
