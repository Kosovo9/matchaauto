
import React from 'react';

/**
 * 🍯 Honeypot Component
 * Renders an invisible input field that only bots will fill out.
 */
const HoneypotField: React.FC<{ name?: string }> = ({ name = 'website' }) => {
    return (
        <div style={{ display: 'none', visibility: 'hidden' }} aria-hidden="true">
            <input
                type="text"
                name={name}
                tabIndex={-1}
                autoComplete="off"
            />
        </div>
    );
};

export default HoneypotField;
