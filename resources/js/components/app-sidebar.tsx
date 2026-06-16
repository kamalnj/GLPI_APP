import { LayoutGrid, NotepadText, TriangleAlert, UserRound  } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import logo from '@/assets/logo.png';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Inventaire',
        href: '/inventaire',
        icon: NotepadText,
    },
    {
        title: 'Alertes',
        href: '/alertes',
        icon: TriangleAlert,
    },
        {
        title: 'Collaborateurs',
        href: '/collaborateurs',
        icon: UserRound,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <span className="flex h-full w-full items-center justify-center">
                                <img
                                    src={logo}
                                    alt="Logo entreprise"
                                    className="h-8 w-auto object-contain"
                                />
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
