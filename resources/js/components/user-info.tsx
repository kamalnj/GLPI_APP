import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user?: User | null;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    // 🔥 IMPORTANT : éviter crash React
    if (!user) {
        return null; // ou loader / skeleton si tu veux
    }

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
<AvatarFallback>
    {user ? getInitials(user.name) : '??'}
</AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>

                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}