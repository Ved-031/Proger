import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>
type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"], 200>

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const res = await client.api.members[":memberId"]["$delete"]({ param });

            if(!res.ok){
                throw new Error("Failed to delete member");
            }

            return await res.json();
        },
        onSuccess: () => {
            toast.success("Member deleted");
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
        onError: () => {
            toast.error("Failed to delete member");
        }
    })

    return mutation;
}