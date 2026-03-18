// components/inventaire/details/SidebarNav.tsx

import { JSX } from 'react';

export type Section = {
    id: string;
    title: string;
    icon: JSX.Element;
    count?: number;
};

type Props = {
    sections: Section[];
    activeSection: string;
    onSelect: (id: string) => void;
};

export default function SidebarNav({ sections, activeSection, onSelect }: Props) {
    return (
        <nav className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-4 pt-4 pb-2">
                <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    Navigation
                </span>
            </div>
            {/* Mobile: horizontal scroll */}
            <ul className="flex flex-row gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:gap-0.5">
                {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                        <li key={section.id} className="shrink-0 md:shrink">
                            <button
                                onClick={() => onSelect(section.id)}
                                className={`nav-btn flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 md:py-2.5 text-sm whitespace-nowrap ${
                                    isActive
                                        ? 'bg-gray-900 font-semibold text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={isActive ? 'text-white' : 'text-gray-400'}>
                                        {section.icon}
                                    </span>
                                    <span className="hidden sm:inline md:inline">{section.title}</span>
                                </div>
                                {section.count !== undefined && (
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {section.count}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}