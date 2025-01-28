import { toast } from "sonner";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const res = await client.api.auth.logout["$post"]();
            if(!res.ok){
                throw new Error("Failed to logout");
            }
            return await res.json();
        },
        onSuccess: () => {
            toast.success("Logged out");
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["current"] });
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
        onError: () => {
            toast.error("Failed to logout");
        }
    })

    return mutation;
}