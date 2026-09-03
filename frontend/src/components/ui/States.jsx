import React from 'react';
import './ui.css';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="empty-state">
        {Icon && (
            <span className="empty-state__icon">
                <Icon size={26} strokeWidth={1.7} />
            </span>
        )}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {action}
    </div>
);

export const SkeletonCard = ({ lines = 3 }) => (
    <div className="skeleton-card">
        <div className="skeleton" style={{ width: '38%', height: 12 }} />
        <div className="skeleton" style={{ width: '100%', height: 15 }} />
        <div className="skeleton" style={{ width: '86%', height: 15 }} />
        {lines > 3 && <div className="skeleton" style={{ width: '62%', height: 15 }} />}
    </div>
);

export const SkeletonGrid = ({ count = 6, lines = 3 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} lines={lines} />
        ))}
    </>
);

export const ErrorState = ({ message, onRetry }) => (
    <div className="empty-state empty-state--error">
        <h3>Something went wrong</h3>
        <p>{message}</p>
        {onRetry && (
            <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
                Try again
            </button>
        )}
    </div>
);
