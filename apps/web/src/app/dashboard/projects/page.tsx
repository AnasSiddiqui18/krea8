"use client"

import { ProjectCard } from "@/components/landing/projects-card"
import { useFetch } from "@/hooks/use-fetch"
import { projects } from "@/queries/project.queries"
import { Skeleton } from "@repo/ui/components/skeleton"
import { CircleAlert, Plus } from "lucide-react"

function ProjectCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 w-full">
            <Skeleton className="h-52 w-full rounded-xl bg-primary/15" />
            <Skeleton className="h-3 w-1/2 rounded-md bg-primary/10" />
            <Skeleton className="h-3 w-2/3 rounded-md bg-primary/10" />
        </div>
    )
}

function ProjectsSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-7 max-w-7xl w-full">
            {[...Array(9)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    )
}
export default function Page() {
    const { data, isPending, error } = useFetch({
        queryKey: ["fetch_projects"],
        queryFn: async () => {
            const response = await projects.get()
            if (!response.success) {
                throw new Error("Failed to get projects")
            }

            return response.data
        },
    })

    return (
        <div className="min-h-screen flex items-start py-24 container">
            {isPending && <ProjectsSkeleton />}

            <div className="grid grid-cols-3 space-y-7 space-x-5">
                {!error && !isPending && data ? (
                    <>
                        <div className="flex flex-col gap-3">
                            <div
                                className="h-52 w-sm rounded-xl border-2 border-dashed border-secondary-200/50 overflow-hidden flex items-center justify-center hover:bg-secondary/20 cursor-pointer"
                                onClick={() => (window.location.href = "/")}
                            >
                                <Plus className="text-primary" />
                            </div>

                            <span className="text-md">Create new project</span>
                        </div>

                        {data.map((project, k) => {
                            return <ProjectCard project={project} key={k} />
                        })}
                    </>
                ) : (
                    error && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-background p-6 border-2">
                                <CircleAlert className="h-10 w-10 text-destructive" />

                                <div className="text-center space-y-1">
                                    <h2 className="text-base font-semibold">{error.message}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        We couldn’t fetch your projects. Please try again or go back home.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
                                    >
                                        Reload
                                    </button>

                                    <button
                                        onClick={() => (window.location.href = "/")}
                                        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                                    >
                                        Go to Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
