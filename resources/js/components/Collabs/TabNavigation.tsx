import { LucideIcon } from 'lucide-react';

type Tab = 'machines' | 'networks' | 'activity';

interface TabNavigationProps {
    tabs: {
        key: Tab;
        label: string;
        icon: LucideIcon;
    }[];
    activeTab: Tab;
    counts: Record<Tab, number>;
    onTabChange: (key: Tab) => void;
}

export default function TabNavigation({
    tabs,
    activeTab,
    counts,
    onTabChange,
}: TabNavigationProps) {
    return (
        <div
            className="border-b"
            role="tablist"
            aria-label="Sections du collaborateur"
        >
            <div className="flex gap-1 sm:gap-2">
                {tabs.map(({ key, label, icon: Icon }) => {
                    const active = activeTab === key;
                    return (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={active}
                            aria-controls={`panel-${key}`}
                            id={`tab-${key}`}
                            onClick={() => onTabChange(key)}
                            className={`relative flex items-center gap-2 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4 ${
                                active
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{label}</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                                    active
                                        ? 'bg-foreground/10 text-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {counts[key]}
                            </span>

                            {active && (
                                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
