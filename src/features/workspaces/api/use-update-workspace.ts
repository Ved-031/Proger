import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>


export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form, param }) => {
            const res = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param });

            if(!res.ok){
                throw new Error("Failed to update workspace");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Workspace updated");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: () => {
            toast.error("Failed to update workspace");
        }
    })

    return mutation;
}