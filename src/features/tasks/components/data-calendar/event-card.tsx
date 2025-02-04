import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { TaskStatus } from "../../types";

interface EventCardProps {
    id: string;
    title: string;
    status: TaskStatus;
    project: Project;
    assignee: Member;
}

const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: "border-l-pink-500",
    [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
    [TaskStatus.IN_REVIEW]: "border-l-blue-500",
    [TaskStatus.TODO]: "border-l-red-500",
    [TaskStatus.DONE]: "border-l-emerald-500",
}

export const EventCard = ({ id, status, title, project, assignee }: EventCardProps) => {

    const router = useRouter();

    const workspaceId = useWorkspaceId();

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    return (
        <div className="px-2">
            <div 
                onClick={onClick}
                className={cn(
                    "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer transition hover:opacity-75 line-clamp-[0.5rem] sm:line-clamp-none items-start",
                    statusColorMap[status]
                )}
            >
                <p>{title}</p>
                <div className="flex flex-col sm:flex-row items-center gap-x-1 gap-y-1">
                    <MemberAvatar 
                        name={assignee?.name}
                    />
                    <div className="size-1 rounded-full bg-neutral-300 hidden sm:block" />
                    <ProjectAvatar 
                        name={project?.name}
                        image={project?.imageUrl}
                    />
                </div>
            </div>
        </div>
    )
}