import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const res = await client.api.tasks[":taskId"]["$delete"]({ param });

            if(!res.ok){
                throw new Error("Failed to delete task");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Task deleted");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
        },
        onError: () => {
            toast.error("Failed to delete task");
        }
    })

    return mutation;
}