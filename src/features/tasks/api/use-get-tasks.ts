import { client } from "@/lib/rpc";

import { useQuery } from "@tanstack/react-query";
import { TaskStatus } from "../types";


interface useGetTasksProps {
    workspaceId: string;
    projectId?: string;
    assigneeId?: string;
    status?: TaskStatus;
    search?: string;
    dueDate?: string;
}

export const useGetTasks = ({ workspaceId, projectId, assigneeId, status, search, dueDate }: useGetTasksProps) => {

    const query = useQuery({
        queryKey: ["tasks", workspaceId],
        queryFn: async () => {
            const res = await client.api.tasks["$get"]({ 
                query: { 
                    workspaceId, 
                    projectId, 
                    assigneeId, 
                    status, 
                    search, 
                    dueDate 
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