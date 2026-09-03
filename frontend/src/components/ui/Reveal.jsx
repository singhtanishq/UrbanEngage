import React, { useEffect, useRef, useState } from 'react';

/**
 * Reveals children with a fade-up animation when scrolled into view.
 * Pairs with the `.reveal` / `.is-visible` classes in base.css.
 */
const Reveal = ({ children, delay = 0, as: Tag = 'div', className = '', once = true, ...rest }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [once]);

    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
            style={{ '--reveal-delay': `${delay}ms` }}
            {...rest}
        >
            {children}
        </Tag>
    );
};

export default Reveal;
