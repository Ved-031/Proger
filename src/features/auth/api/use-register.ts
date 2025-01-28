import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>

export const useRegister = () => {
    const router = useRouter();
    
    const mutation = useMutation<
        ResponseType, 
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const res = await client.api.auth.register["$post"]({ json });
            if(!res.ok){
                throw new Error("Failed to register");
            }
            return await res.json();
        },
        onSuccess: () => {
            toast.success("Registered");
            router.push("/");
        },
        onError: () => {
            toast.error("Failed to register");
        }
    })

    return mutation;
}