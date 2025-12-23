import { Chip } from "@heroui/chip"

interface Project {
    id: string
    title: string
    description: string
    image?: string
    updatedAt: string
    status: "draft" | "published" | "archived"
}

export function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="h-52 overflow-hidden  w-full max-w-sm rounded-xl border border-border bg-background ">
                <img
                    src="https://www.coderocket.app/placeholder.svg"
                    alt="project preview"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-sm font-semibold truncate">{project.title}</h3>

                <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                    <span>{project.updatedAt}</span>
                    <Chip variant="flat" color="success" className="capitalize" size="sm">
                        {project.status}
                    </Chip>
                </div>
            </div>
        </div>
    )
}
