import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>
type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"], 200>

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();
    
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const res = await client.api.workspaces[":workspaceId"]["join"]["$post"]({ json, param });

            if(!res.ok){
                throw new Error("Failed to join workspace");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Joined workspace");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: () => {
            toast.error("Failed to join workspace");
        }
    })

    return mutation;
}