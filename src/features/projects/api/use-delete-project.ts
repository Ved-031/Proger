import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$delete"], 200>

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const res = await client.api.projects[":projectId"]["$delete"]({ param });
            
            if(!res.ok){
                throw new Error("Failed to delete project");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Project deleted");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
        },
        onError: () => {
            toast.error("Failed to delete project");
        }
    })

    return mutation;
}