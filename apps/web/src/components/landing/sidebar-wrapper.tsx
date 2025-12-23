"use client"

import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"

export function SidebarWrapper({ children }: { children: ReactNode }) {
    const pathName = usePathname()
    const allowedRoutes = ["/dashboard/projects", "/"]

    return (
        <>
            {allowedRoutes.includes(pathName) ? (
                <SidebarProvider>
                    <AppSidebar />
                    <main className="relative min-h-screen w-full">
                        <SidebarTrigger className="absolute z-50" title="Close sidebar" />
                        {children}
                    </main>
                </SidebarProvider>
            ) : (
                <>{children}</>
            )}
        </>
    )
}
