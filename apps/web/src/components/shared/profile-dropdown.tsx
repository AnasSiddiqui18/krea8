import { LogOut, Settings, User } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"

type ProfileDropdownProps = {
    user: {
        id: string
        createdAt: Date
        updatedAt: Date
        email: string
        emailVerified: boolean
        name: string
        image?: string | null | undefined
    }

    logout: () => void
}

export function ProfileDropdown({ session }: { session: ProfileDropdownProps }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="outline-none">
                    <img
                        className="size-8 rounded-full border"
                        src={session.user.image ?? "https://github.com/evilrabbit.png"}
                        alt="user-avatar"
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{session.user.name ?? "Account"}</div>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="focus:bg-primary/10">
                    <User className="mr-2 size-4" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem className="focus:bg-primary/10">
                    <Settings className="mr-2 size-4" />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-primary/10"
                    onClick={session.logout}
                >
                    <LogOut className="mr-2 size-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
