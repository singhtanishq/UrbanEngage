import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `target` with an ease-out curve once `start` becomes true.
 * Respects prefers-reduced-motion by jumping straight to the target.
 */
export const useCountUp = (target, { duration = 1400, start = true } = {}) => {
    const [value, setValue] = useState(0);
    const frame = useRef(null);

    useEffect(() => {
        if (!start) return undefined;

        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            setValue(target);
            return undefined;
        }

        const t0 = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) frame.current = requestAnimationFrame(tick);
        };

        frame.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame.current);
    }, [target, duration, start]);

    return value;
};
