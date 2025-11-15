
import React, { useState } from 'react';

interface CopyButtonProps {
    textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className={`px-2 py-1 rounded-md text-xs transition-colors ${
                copied
                    ? 'bg-green-100 text-green-700 dark:bg-green-800/50 dark:text-green-300'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'
            }`}
        >
            {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-regular fa-copy"></i>}
        </button>
    );
};

export default CopyButton;
