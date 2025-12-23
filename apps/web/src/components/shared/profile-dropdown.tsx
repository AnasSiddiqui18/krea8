import { LogOut, User as UserIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import type { User } from "better-auth"
import { cn } from "@repo/ui/lib/utils"

type ProfileDropdownProps = {
    user: User
    logout: () => void
}

export function ProfileDropdown({ session }: { session: ProfileDropdownProps }) {
    const { user } = session

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-2",
                        "transition-colors",
                        "hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-primary",
                    )}
                >
                    <img
                        src={user.image ?? "https://github.com/evilrabbit.png"}
                        alt="user-avatar"
                        className="size-8 rounded-full border"
                    />

                    <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.name ?? "Account"}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" className="w-72 rounded-xl p-2">
                <div className="flex items-center gap-3 px-2 py-2">
                    <img
                        src={user.image ?? "https://github.com/evilrabbit.png"}
                        alt="user-avatar"
                        className="size-9 rounded-full border"
                    />

                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <UserIcon className="mr-2 size-4" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={session.logout}
                    className="text-red-600 focus:bg-red-500/10 focus:text-red-600"
                >
                    <LogOut className="mr-2 size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
