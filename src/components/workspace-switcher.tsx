"use client";

import { useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export const WorkspaceSwitcher = () => {

    const router = useRouter();
    const { data: workspaces } = useGetWorkspaces();
    const workspaceId = useWorkspaceId();
    const { open } = useCreateWorkspaceModal();

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">Workspaces</p>
                <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition-opacity" />
            </div>
            <Select value={workspaceId} onValueChange={(value: string) => router.push(`/workspaces/${value}`)}>
                <SelectTrigger className="w-full bg-neutral-200 font-medium p-2">
                    <SelectValue placeholder="No workspace selected" />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.documents.map((workspace) => (
                        <SelectItem key={workspace.$id} value={workspace.$id} className="cursor-pointer">
                            <div className="flex items-center justify-start gap-3 font-medium">
                                <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                                <span className="truncate">{workspace.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
