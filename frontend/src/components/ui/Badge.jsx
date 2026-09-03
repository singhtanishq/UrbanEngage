import React from 'react';
import './ui.css';

/** Category chip with automatic color from the design-token category palette. */
const CATEGORY_VARS = [
    'general', 'infrastructure', 'safety', 'environment', 'technology',
    'health', 'education', 'community', 'governance',
];

export const CategoryBadge = ({ category }) => {
    const key = (category || 'general').toLowerCase().replace(/\s+/g, '-');
    const token = CATEGORY_VARS.includes(key) ? key : 'general';
    return (
        <span
            className="cat-badge"
            style={{
                color: `var(--cat-${token})`,
                background: `var(--cat-${token}-bg)`,
            }}
        >
            {category}
        </span>
    );
};

/** Status badge for issues: Open | In Progress | Resolved */
export const StatusBadge = ({ status }) => {
    const map = {
        Open: 'cat-badge',
        'In Progress': 'cat-badge',
        Resolved: 'cat-badge',
    };
    const style = {
        Open: { color: 'var(--info)', background: 'var(--info-bg)' },
        'In Progress': { color: 'var(--warning)', background: 'var(--warning-bg)' },
        Resolved: { color: 'var(--success)', background: 'var(--success-bg)' },
    };
    return (
        <span className={map[status] || 'cat-badge'} style={style[status] || style.Open}>
            {status || 'Open'}
        </span>
    );
};

export default CategoryBadge;
