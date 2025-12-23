"use client"

import { Hero } from "../shared/hero"
import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/sidebar"

export function Landing() {
    return (
        <div className="h-full relative bg-linear-to-br from-blue-300/50 via-white to-pink-200/50">
            <main className="relative h-screen w-full">
                <HeroWithSidebar />
            </main>
        </div>
    )
}

function HeroWithSidebar() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger title="Close sidebar" />
            <Hero />
        </SidebarProvider>
    )
}
