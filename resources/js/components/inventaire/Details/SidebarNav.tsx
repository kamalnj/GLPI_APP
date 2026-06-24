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

export default function SidebarNav({
    sections,
    activeSection,
    onSelect,
}: Props) {
    return (
        <nav className="w-full overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="px-4 pt-4 pb-2">
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
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
                                className={`nav-btn flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap md:py-2.5 ${
                                    isActive
                                        ? 'bg-primary font-semibold text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={
                                            isActive
                                                ? 'text-primary-foreground'
                                                : 'text-muted-foreground'
                                        }
                                    >
                                        {section.icon}
                                    </span>
                                    <span className="hidden sm:inline md:inline">
                                        {section.title}
                                    </span>
                                </div>
                                {section.count !== undefined && (
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                            isActive
                                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
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
