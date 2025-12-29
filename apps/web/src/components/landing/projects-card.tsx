import { Chip } from "@heroui/chip"
import { formatDistanceToNow } from "date-fns"
import { redirect } from "next/navigation"

interface Project {
    image: string | null
    summary: string | null
    id: string
    userId: string
    createdAt: string
    updatedAt: string
}

function formatDate(rawDate: string) {
    const date = new Date(rawDate)
    return formatDistanceToNow(date, { addSuffix: true })
}

export function ProjectCard({ project }: { project: Project }) {
    return (
        <a href={`/projects/${project.id}`} className="flex flex-col gap-3 cursor-pointer">
            <div className="h-52 overflow-hidden w-full max-w-sm rounded-xl border border-border bg-background">
                <img
                    src={project.image ?? "https://www.coderocket.app/placeholder.svg"}
                    alt="project preview"
                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                />
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-sm font-semibold truncate">Fullstack AI App</h3>

                <p className="text-xs text-muted-foreground line-clamp-2">{project.summary ?? "Fallback summary"}</p>

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span>{`Edited ${formatDate(project.updatedAt)}`}</span>
                    <Chip variant="flat" color="success" className="capitalize" size="sm">
                        published
                    </Chip>
                </div>
            </div>
        </a>
    )
}
