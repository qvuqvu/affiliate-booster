
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg p-4 shadow-md sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text">
                        Trợ Lý Content Viral
                    </h1>
                </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Tạo thread affiliate với Gemini</p>
            </div>
        </header>
    );
};

export default Header;
