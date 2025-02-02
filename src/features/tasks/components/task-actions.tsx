"use client";

import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { useDeleteTask } from "../api/use-delete-task";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {

    const workspaceId = useWorkspaceId();

    const router = useRouter();

    const { open } = useUpdateTaskModal();

    const { mutate, isPending } = useDeleteTask();

    const [ConfirmDialog, confirm] = useConfirm({
        title: "Delete task",
        message: "This action cannot be undone.",
        variant: "destructive"
    })

    const handleDeleteTask = async () => {
        const ok = await confirm();

        if(!ok) return;

        mutate({
            param: { taskId: id }
        })
    }

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }

    return (
        <div className="flex justify-end">
            <ConfirmDialog />
            <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={onOpenTask}
                    className="font-medium p-[10px] cursor-pointer"
                >
                    <ExternalLinkIcon className="size-4 stroke-2" />
                    Task Details
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={onOpenProject}
                    className="font-medium p-[10px] cursor-pointer"
                >
                    <ExternalLinkIcon className="size-4 stroke-2" />
                    Open Project
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => open(id)}
                    className="font-medium p-[10px] cursor-pointer"
                >
                    <PencilIcon className="size-4 stroke-2" />
                    Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDeleteTask}
                    disabled={isPending}
                    className="text-amber-700 focus:text-amber-700 font-medium p-[10px] cursor-pointer"
                >
                    <TrashIcon className="size-4 stroke-2" />
                    Delete Task
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
    )
}