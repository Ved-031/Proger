import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"], 200>

export const useBulkUpdateTasks = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const res = await client.api.tasks["bulk-update"]["$post"]({ json });

            if(!res.ok){
                throw new Error("Failed to update tasks");
            }

            return await res.json();
        },
        onSuccess: () => {
            toast.success("Tasks updated");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
        },
        onError: () => {
            toast.error("Failed to update tasks");
        }
    })

    return mutation;
}