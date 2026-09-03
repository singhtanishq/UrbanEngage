import React from 'react';
import { initials, avatarGradient } from '../../utils/format';
import './ui.css';

const Avatar = ({ name, size = 38 }) => (
    <span
        className="avatar"
        style={{ width: size, height: size, fontSize: size * 0.38, background: avatarGradient(name) }}
        aria-hidden="true"
    >
        {initials(name)}
    </span>
);

export default Avatar;
