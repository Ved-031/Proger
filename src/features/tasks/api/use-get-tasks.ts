import { client } from "@/lib/rpc";

import { useQuery } from "@tanstack/react-query";

import { TaskStatus } from "../types";


interface useGetTasksProps {
    workspaceId: string;
    projectId?: string | null;
    assigneeId?: string | null;
    status?: TaskStatus | null;
    search?: string | null;
    dueDate?: string | null;
}

export const useGetTasks = ({ workspaceId, projectId, assigneeId, status, search, dueDate }: useGetTasksProps) => {

    const query = useQuery({
        queryKey: [
            "tasks", 
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate
        ],
        queryFn: async () => {
            const res = await client.api.tasks["$get"]({ 
                query: { 
                    workspaceId, 
                    projectId: projectId ?? undefined, 
                    assigneeId: assigneeId ?? undefined, 
                    status: status ?? undefined, 
                    search: search ?? undefined, 
                    dueDate: dueDate ?? undefined 
                } 
            });

            if(!res.ok){
                throw new Error("Failed to fetch tasks");
            }

            const { data } = await res.json();

            return data;
        }
    })

    return query;
}