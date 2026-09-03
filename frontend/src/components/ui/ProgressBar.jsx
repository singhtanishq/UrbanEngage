import React from 'react';
import './ui.css';

/** Animated progress bar (0–100) with optional label. */
export const ProgressBar = ({ value, max = 100, className = '' }) => {
    const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
    return (
        <div className={`progress ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress__fill" style={{ width: `${pct}%` }} />
        </div>
    );
};

export default ProgressBar;
