import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './ui.css';

/**
 * Dialog rendered through a portal on <body>, so it always positions
 * against the viewport — even when an ancestor (e.g. an animated page
 * wrapper) carries a transform that would otherwise become the
 * containing block for position: fixed.
 *
 * While open, body scrolling is locked and the scrollbar's width is
 * compensated with padding so the page doesn't shift sideways.
 */
const Modal = ({ open, onClose, title, subtitle, children, wide = false, bodyClassName = '' }) => {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal__head">
                    <div>
                        <h3 className="modal__title">{title}</h3>
                        {subtitle && <p className="modal__subtitle">{subtitle}</p>}
                    </div>
                    <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
                        <X size={18} />
                    </button>
                </div>
                <div className={`modal__body ${bodyClassName}`}>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
