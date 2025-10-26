
import React from 'react';

export const StatCard: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-6 rounded-2xl text-center border border-indigo-400/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-indigo-500/30">
        <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(102,126,234,0.5)]">
            {value}
        </div>
        <div className="text-slate-300 font-medium">{label}</div>
    </div>
);
