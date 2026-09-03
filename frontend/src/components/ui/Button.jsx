import React from 'react';
import { Loader2 } from 'lucide-react';
import './ui.css';

/**
 * Button with variants: primary | ghost | outline | danger | dark
 * size: md | sm | lg
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconRight: IconRight,
    children,
    className = '',
    disabled,
    type = 'button',
    ...rest
}) => (
    <button
        type={type}
        className={`btn btn--${variant} btn--${size} ${className}`}
        disabled={disabled || loading}
        {...rest}
    >
        {loading && <Loader2 size={17} className="btn__spinner" />}
        {!loading && Icon && <Icon size={17} />}
        <span>{children}</span>
        {IconRight && <IconRight size={17} />}
    </button>
);

export default Button;
