import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$patch"], 200>

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const res = await client.api.members[":memberId"]["$patch"]({ json, param });

            if(!res.ok){
                throw new Error("Failed to update member");
            }

            return await res.json();
        },
        onSuccess: () => {
            toast.success("Member updated");
            queryClient.invalidateQueries({ queryKey: ["members"] });
        },
        onError: () => {
            toast.error("Failed to update member");
        }
    })

    return mutation;
}