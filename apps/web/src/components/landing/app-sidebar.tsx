"use client"

import { authClient } from "@/lib/auth-client"
import { Spinner } from "@heroui/react"
import { Button } from "@repo/ui/components/button"
import {
    Sidebar,
    SidebarMenu,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@repo/ui/components/sidebar"
import { cn } from "@repo/ui/lib/utils"
import { Folder, Home } from "lucide-react"
import { redirect, usePathname, useRouter } from "next/navigation"
import { ProfileDropdown } from "../shared/profile-dropdown"

const sidebarItems = [
    {
        name: "Home",
        icon: Home,
        url: "/",
    },
    {
        name: "Projects",
        icon: Folder,
        url: "/projects",
    },
]

export function AppSidebar() {
    const pathName = usePathname()

    const session = authClient.useSession()
    const router = useRouter()

    const handleLogout = async () => {
        await authClient.signOut()
        router.refresh()
    }

    return (
        <Sidebar>
            <SidebarHeader className="px-3 py-4 font-bold text-2xl text-primary cursor-pointer">Krea8 🚀</SidebarHeader>

            <SidebarContent className="px-2">
                {!session.isPending && session.data?.user ? (
                    <SidebarMenu>
                        {sidebarItems.map((item) => {
                            const isActive = item.url === pathName

                            return (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                            "hover:bg-accent/50",
                                            isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                                        )}
                                    >
                                        <a href={item.url}>
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                ) : session.isPending ? (
                    <Spinner size="sm" />
                ) : null}
            </SidebarContent>

            <SidebarFooter className="border-t px-3 py-3">
                {!session.data && !session.isPending ? (
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" className="w-full" onClick={() => redirect("/auth/signin")}>
                            Sign In
                        </Button>
                        <Button className="w-full" onClick={() => redirect("/auth/signup")}>
                            Sign Up
                        </Button>
                    </div>
                ) : session.isPending ? (
                    <div className="flex justify-center py-2">
                        <Spinner size="sm" />
                    </div>
                ) : (
                    session.data && (
                        <ProfileDropdown
                            session={{
                                user: session.data.user,
                                logout: handleLogout,
                            }}
                        />
                    )
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
