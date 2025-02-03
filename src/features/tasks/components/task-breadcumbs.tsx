import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, Loader, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useConfirm } from "@/hooks/use-confirm";
import { Project } from "@/features/projects/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { Task } from "../types";
import { useDeleteTask } from "../api/use-delete-task";


interface TaskBreadcrumbsProps {
    project: Project;
    task: Task;
}

export const TaskBreadcrumbs = ({ project, task }: TaskBreadcrumbsProps) => {

    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const { mutate, isPending } = useDeleteTask();
    const [ConfirmDialog, confirm] = useConfirm({
        title: "Delete task?",
        message: "This action cannot be undone.",
        variant: "destructive"
    });

    const handleDeleteTask = async () => {
        const ok = await confirm();

        if(!ok) return;

        mutate({
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        })
    }

    return (
        <div className="flex items-center gap-x-2">
            <ConfirmDialog />
            <ProjectAvatar 
                name={project.name}
                image={project.imageUrl}
                className="size-6 lg:size-8"
            />
            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <p className="text-sm lg:text-[16px] font-semibold text-muted-foreground hover:opacity-75 transition">
                    {project.name}
                </p>
            </Link>
            <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
            <p className="text-sm lg:text-[16px] font-semibold">{task.name}</p>
            <Button
                className="ml-auto"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDeleteTask}
            >   
                {isPending 
                    ? <Loader className="size-4 animate-spin text-muted-foreground" /> 
                    : (
                        <>
                            <TrashIcon className="size-4" />
                            <span className="hidden md:block">Delete task</span>
                        </>
                    )
                }
            </Button>
        </div>
    )
}