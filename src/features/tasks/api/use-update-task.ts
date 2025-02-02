import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>

export const useUpdateTask = () => {
    const router = useRouter();
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
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
        },
        onError: () => {
            toast.error("Failed to update task");
        }
    })

    return mutation;
}