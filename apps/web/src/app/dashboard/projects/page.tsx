"use client"

import { ProjectCard } from "@/components/landing/projects-card"
import { Plus } from "lucide-react"

export const projects = [
    {
        id: "proj_1",
        title: "AI Website Generator",
        description: "Generate modern landing pages using AI prompts.",
        image: "https://www.coderocket.app/placeholder.svg",
        updatedAt: "2 hours ago",
        status: "published" as const,
    },
    {
        id: "proj_2",
        title: "Design System Builder",
        description: "Create and manage reusable UI components.",
        image: "https://www.coderocket.app/placeholder.svg",
        updatedAt: "Yesterday",
        status: "draft" as const,
    },
    {
        id: "proj_3",
        title: "Portfolio Generator",
        description: "Build developer portfolios with a single prompt.",
        image: "https://www.coderocket.app/placeholder.svg",
        updatedAt: "3 days ago",
        status: "published" as const,
    },
    {
        id: "proj_4",
        title: "SaaS Landing Page",
        description: "High-converting landing pages for SaaS products.",
        image: "https://www.coderocket.app/placeholder.svg",
        updatedAt: "1 week ago",
        status: "archived" as const,
    },
]

export default function Page() {
    return (
        <div className="min-h-screen flex items-start py-24 container">
            <div className="grid grid-cols-3 space-y-7 space-x-5">
                <div className="flex flex-col gap-3">
                    <div
                        className="h-52 w-sm rounded-xl border-2 border-dashed border-secondary-200/50 overflow-hidden flex items-center justify-center hover:bg-secondary/20 cursor-pointer"
                        onClick={() => (window.location.href = "/")}
                    >
                        <Plus className="text-primary" />
                    </div>

                    <span className="text-md">Create new project</span>
                </div>

                {projects.map((project, k) => {
                    return <ProjectCard project={project} key={k} />
                })}
            </div>
        </div>
    )
}
