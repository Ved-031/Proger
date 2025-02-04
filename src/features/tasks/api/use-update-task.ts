import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const res = await client.api.tasks[":taskId"]["$patch"]({ json, param });

            if(!res.ok){
                throw new Error("Failed to update task");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Task updated");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
        },
        onError: () => {
            toast.error("Failed to update task");
        }
    })

    return mutation;
}